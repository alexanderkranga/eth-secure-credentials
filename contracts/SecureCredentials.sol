// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SecureCredentials is Ownable {
    struct Credentials {
        string name;
        string username;
        string password;
        string note;
    }

    mapping(address => Credentials[]) vault;

    function addCredentials(
        string memory _name,
        string memory _username,
        string memory _password,
        string memory _note
    ) external {
        require(bytes(_name).length != 0, "ERROR: credentials name is required");
        require(bytes(_username).length != 0, "ERROR: credentials username is required");
        require(bytes(_password).length != 0, "ERROR: credentials password is required");

        Credentials memory credentials = Credentials(_name, _username, _password, _note);

        vault[msg.sender].push(credentials);
    }

    function updateCredentials(
        string memory _currentName,
        string memory _newName,
        string memory _newUsername,
        string memory _newPassword,
        string memory _newNote
    ) external {
        require(bytes(_currentName).length != 0, "ERROR: credentials name is required");
        require(bytes(_newName).length != 0, "ERROR: credentials new name is required");
        require(bytes(_newUsername).length != 0, "ERROR: credentials new username is required");
        require(bytes(_newPassword).length != 0, "ERROR: credentials new password is required");

        Credentials[] storage credentials = vault[msg.sender];

        for (uint256 credentialsIndex = 0; credentialsIndex < credentials.length; credentialsIndex++) {
            if (
                keccak256(abi.encodePacked(credentials[credentialsIndex].name)) ==
                keccak256(abi.encodePacked(_currentName))
            ) {
                credentials[credentialsIndex].name = _newName;
                credentials[credentialsIndex].note = _newNote;
                credentials[credentialsIndex].username = _newUsername;
                credentials[credentialsIndex].password = _newPassword;
                break;
            }
        }
    }

    function deleteCredentials(string memory _currentName) external {
        require(bytes(_currentName).length != 0, "ERROR: credentials name is required");

        Credentials[] storage credentials = vault[msg.sender];
        uint256 foundAt = 0;
        bool found = false;

        for (uint256 credentialsIndex = 0; credentialsIndex < credentials.length; credentialsIndex++) {
            if (
                keccak256(abi.encodePacked(credentials[credentialsIndex].name)) ==
                keccak256(abi.encodePacked(_currentName))
            ) {
                found = true;
                foundAt = credentialsIndex;
                break;
            }
        }

        if (found) {
            credentials[foundAt] = credentials[credentials.length-1];
            credentials.pop();
        }
    }

    function getCredentials() external view returns (Credentials[] memory) {
        return vault[msg.sender];
    }
}
