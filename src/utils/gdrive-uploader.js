const fs = require('fs')
const { google } = require('googleapis')
const axios = require('axios')
const path = require('path')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata'];

const CODE = '4/wAE4OcSZhHm5FRRNzbM0YU4OZE4t_fEu0NKX80Kee8Nqptr3SM2DMcA'

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.resolve(__dirname, "..", "..", "token.json")
const CREDENTIALS = 'credentials.json'
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    try {
        let token = fs.readFileSync(TOKEN_PATH)
        oAuth2Client.setCredentials(JSON.parse(token))
        return oAuth2Client
    } catch (err) {
        console.log(err.message)
        return getAccessToken(oAuth2Client, callback);
    }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    try {
        let token = await oAuth2Client.getToken(CODE)
        console.log(token)
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        console.log(JSON.stringify(token))
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token))
        resolve2(oAuth2Client)
    } catch (err) {
        console.log(err.message)
        throw err
    }
}

async function getPregeneratedIds(count, space) {
    console.log(TOKEN_PATH)
    let token = fs.readFileSync(TOKEN_PATH)
    console.log(JSON.parse(token))
    let url = `https://www.googleapis.com/drive/v3/files/generateIds?count=${count}&space=${space}`
    let headers = {
        "Authorization": `Bearer ${token.access_token}`,
        "Accept": "application/json"
    }
    try {
        let resp = await axios.get(url, { headers });
        return resp.data.ids
    } catch (err) {
        throw err;
    }
}

async function uploadFile(destFileName, sourceFilePath, mimeType) {
    let credentials = fs.readFileSync(CREDENTIALS)
    let auth = await authorize(JSON.parse(credentials))
    let ids = await getPregeneratedIds(1, 'drive');
    const drive = google.drive({ version: 'v3', auth });
    var fileMetadata = {
        name: destFileName,
        id: ids[0]
    };
    var media = {
        mimeType: mimeType,
        body: fs.createReadStream(sourceFilePath)
    }
    let fileId = await new Promise((resolve, reject) => {
        drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, function (err, file) {
            if (err) {
                // Handle error
                console.error(err)
                reject(err)
            } else {
                console.log(`File Id - ` + file.data.id)
                resolve(file.data.id)
            }
        })
    })
    return fileId
}


(async function () {
    console.log("Going to upload file")
    let id = await uploadFile("Sample33", "/Users/manan/Downloads/Test.pdf", "application/pdf")
    console.log(`File ${id} uploaded`)
})()
