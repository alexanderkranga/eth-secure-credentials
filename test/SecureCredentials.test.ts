import chai from "chai";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { SecureCredentials } from "../typechain";

chai.use(solidity);

const { expect } = chai;

describe("SecureCredentials contract", function () {
    let secureCredentialsContract: SecureCredentials;

    beforeEach(async function () {
        const secureCredentials = await ethers.getContractFactory("SecureCredentials");
        secureCredentialsContract = (await secureCredentials.deploy()) as SecureCredentials;
        await secureCredentialsContract.deployed();
    });

    it("should set the right owner", async function () {
        const [owner] = await ethers.getSigners();
        expect(await secureCredentialsContract.owner()).to.equal(owner.address);
    });

    it("should return empty credentials for owner address", async function () {
        const credentials: SecureCredentials.CredentialsStructOutput[] =
            await secureCredentialsContract.getCredentials();
        expect(credentials.length).to.equal(0);
    });

    it("should return empty credentials for new address", async function () {
        const [_, addr1] = await ethers.getSigners();
        const ownerCredentials = await secureCredentialsContract.getCredentials();
        expect(ownerCredentials.length).to.equal(0);

        const addr1Credentials = await secureCredentialsContract.connect(addr1).getCredentials();
        expect(addr1Credentials.length).to.equal(0);
    });

    it("should return 1 credential", async function () {
        const [_, addr1] = await ethers.getSigners();

        const name = "name1";
        const username = "username1";
        const password = "password1";
        const note = "note1";

        await secureCredentialsContract.connect(addr1).addCredentials(name, username, password, note);

        const addr1Credentials = await secureCredentialsContract.connect(addr1).getCredentials();

        expect(addr1Credentials.length).to.equal(1);
    });

    it("should return 2 credentials for valid owner", async function () {
        const [_, addr1, addr2] = await ethers.getSigners();

        const name = "name1";
        const username = "username1";
        const password = "password1";
        const note = "note1";

        const name2 = "name2";
        const username2 = "username2";
        const password2 = "password2";
        const note2 = "note2";

        await secureCredentialsContract.connect(addr1).addCredentials(name, username, password, note);
        await secureCredentialsContract.connect(addr1).addCredentials(name2, username2, password2, note2);

        const addr1Credentials = await secureCredentialsContract.connect(addr1).getCredentials();
        expect(addr1Credentials.length).to.equal(2);

        const addr2Credentials = await secureCredentialsContract.connect(addr2).getCredentials();
        expect(addr2Credentials.length).to.equal(0);
    });

    it("should update credentials correctly", async function () {
        const [_, addr1] = await ethers.getSigners();

        const name = "name1";
        const username = "username1";
        const password = "password1";
        const note = "note1";

        const name2 = "name2";
        const username2 = "username2";
        const password2 = "password2";
        const note2 = "note2";

        const name3 = "name3";
        const username3 = "username3";
        const password3 = "password3";
        const note3 = "note3";

        await secureCredentialsContract.connect(addr1).addCredentials(name3, username3, password3, note3);
        await secureCredentialsContract.connect(addr1).addCredentials(name, username, password, note);
        await secureCredentialsContract.connect(addr1).updateCredentials(name, name2, username2, password2, note2);

        const addr1Credentials = await secureCredentialsContract.connect(addr1).getCredentials();
        expect(addr1Credentials.length).to.equal(2);

        expect(addr1Credentials[0]).to.eql(["name3", "username3", "password3", "note3"]);
        expect(addr1Credentials[1]).to.eql(["name2", "username2", "password2", "note2"]);
    });

    it("should delete credentials correctly", async function () {
        const [_, addr1] = await ethers.getSigners();

        const name = "name1";
        const username = "username1";
        const password = "password1";
        const note = "note1";

        const name2 = "name2";
        const username2 = "username2";
        const password2 = "password2";
        const note2 = "note2";

        const name3 = "name3";
        const username3 = "username3";
        const password3 = "password3";
        const note3 = "note3";

        await secureCredentialsContract.connect(addr1).addCredentials(name, username, password, note);
        await secureCredentialsContract.connect(addr1).addCredentials(name2, username2, password2, note2);
        await secureCredentialsContract.connect(addr1).addCredentials(name3, username3, password3, note3);
        await secureCredentialsContract.connect(addr1).deleteCredentials(name2);

        const addr1Credentials = await secureCredentialsContract.connect(addr1).getCredentials();
        expect(addr1Credentials.length).to.equal(2);

        expect(addr1Credentials[0]).to.eql(["name1", "username1", "password1", "note1"]);
        expect(addr1Credentials[1]).to.eql(["name3", "username3", "password3", "note3"]);
    });
});
