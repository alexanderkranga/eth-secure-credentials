Flows:

1. Adding new credentials
    1. Set the passphrase
    2. Set credentials name (required), username, password, note
        var passPhrase = "some pass phrase"

        var name = "github";
        var username = "alexc";
        var password = "hardmond";
        var notes = "this is a note";

        var encryptedName = CryptoJS.AES.encrypt(name, passPhrase).toString();
        var encryptedUsername = CryptoJS.AES.encrypt(username, passPhrase).toString();
        var encryptedPassword = CryptoJS.AES.encrypt(password, passPhrase).toString();
        var encryptedNote = CryptoJS.AES.encrypt(notes, passPhrase).toString();


    3. Save credentials in the vault:
        addNewCredentials(encryptedName, encryptedUsername, encryptedPassword, encryptedNote)

        vault[address][encryptedName] = Credentials(encryptedName, encryptedUsername, encryptedPassword, encryptedNote)