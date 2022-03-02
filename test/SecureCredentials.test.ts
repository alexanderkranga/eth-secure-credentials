import chai from "chai";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { SecureCredentials } from "../typechain";
import { describe } from "mocha";

chai.use(solidity);

const { expect } = chai;

describe("SecureCredentials contract", async () => {
    let secureCredentialsContract: SecureCredentials;

    beforeEach(async () => {
        const secureCredentials = await ethers.getContractFactory("SecureCredentials");
        secureCredentialsContract = (await secureCredentials.deploy()) as SecureCredentials;
        await secureCredentialsContract.deployed();
    });

    describe("on valid input", async () => {
        it("should set the right owner", async () => {
            const [owner] = await ethers.getSigners();
            expect(await secureCredentialsContract.owner()).to.equal(owner.address);
        });

        it("should return empty credentials for owner address", async () => {
            const credentials: SecureCredentials.CredentialsStructOutput[] =
                await secureCredentialsContract.getCredentials();
            expect(credentials.length).to.equal(0);
        });

        it("should return empty credentials for new address", async () => {
            const [_, addr1] = await ethers.getSigners();
            const ownerCredentials = await secureCredentialsContract.getCredentials();
            expect(ownerCredentials.length).to.equal(0);

            const addr1Credentials = await secureCredentialsContract.connect(addr1).getCredentials();
            expect(addr1Credentials.length).to.equal(0);
        });

        it("should return 1 credential", async () => {
            const [_, addr1] = await ethers.getSigners();

            const name = "name1";
            const username = "username1";
            const password = "password1";
            const note = "note1";

            await secureCredentialsContract.connect(addr1).addCredentials(name, username, password, note);

            const addr1Credentials = await secureCredentialsContract.connect(addr1).getCredentials();

            expect(addr1Credentials.length).to.equal(1);
        });

        it("should return 2 credentials for valid owner", async () => {
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

        it("should update credentials correctly", async () => {
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

        it("should delete credentials correctly", async () => {
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

    describe("on invalid input", async () => {
        it("should require credential fields", async () => {
            const [_, addr1] = await ethers.getSigners();

            const name = "name";
            const username = "username";
            const password = "password";
            const note = "note";

            await expect(
                secureCredentialsContract.connect(addr1).addCredentials("", username, password, note),
            ).to.be.revertedWith("ERROR: credentials name is required");

            await expect(
                secureCredentialsContract.connect(addr1).addCredentials(name, "", password, note),
            ).to.be.revertedWith("ERROR: credentials username is required");

            await expect(
                secureCredentialsContract.connect(addr1).addCredentials(name, username, "", note),
            ).to.be.revertedWith("ERROR: credentials password is required");
        });

        it("should require fields on credentials update", async () => {
            const [_, addr1] = await ethers.getSigners();

            const name = "name";
            const username = "username";
            const password = "password";
            const note = "note";

            const nameUpdated = "nameUpdated";
            const usernameUpdated = "usernameUpdated";
            const passwordUpdated = "passwordUpdated";
            const noteUpdated = "noteUpdated";

            await secureCredentialsContract.connect(addr1).addCredentials(name, username, password, note);

            await expect(
                secureCredentialsContract
                    .connect(addr1)
                    .updateCredentials("", nameUpdated, usernameUpdated, passwordUpdated, noteUpdated),
            ).to.be.revertedWith("ERROR: current credentials name is required");

            await expect(
                secureCredentialsContract
                    .connect(addr1)
                    .updateCredentials(name, "", usernameUpdated, passwordUpdated, noteUpdated),
            ).to.be.revertedWith("ERROR: credentials new name is required");

            await expect(
                secureCredentialsContract
                    .connect(addr1)
                    .updateCredentials(name, nameUpdated, "", passwordUpdated, noteUpdated),
            ).to.be.revertedWith("ERROR: credentials new username is required");

            await expect(
                secureCredentialsContract
                    .connect(addr1)
                    .updateCredentials(name, nameUpdated, usernameUpdated, "", noteUpdated),
            ).to.be.revertedWith("ERROR: credentials new password is required");
        });

        it("should require credentials name on delete", async () => {
            const [_, addr1] = await ethers.getSigners();

            const name = "name";
            const username = "username";
            const password = "password";
            const note = "note";

            await secureCredentialsContract.connect(addr1).addCredentials(name, username, password, note);

            await expect(
                secureCredentialsContract
                    .connect(addr1)
                    .deleteCredentials(""),
            ).to.be.revertedWith("ERROR: credentials name is required");
        });
        
        it("should require credentials to be present on delete", async () => {
            const [_, addr1] = await ethers.getSigners();

            const name = "name";
            const username = "username";
            const password = "password";
            const note = "note";

            await secureCredentialsContract.connect(addr1).addCredentials(name, username, password, note);

            await expect(
                secureCredentialsContract
                    .connect(addr1)
                    .deleteCredentials("someOtherName"),
            ).to.be.revertedWith("ERROR: credentials with specified name was not found");
        });
    });
});
