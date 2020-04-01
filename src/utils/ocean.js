const axios = require(axios)

async function publish(data) {
    try {
        const url = `https://agent.oceanprotocol.com/api/general/publish`

        let publishData = await processPublishData(data)

        const response = await axios(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(publishData)
        })

        await response.json()

    } catch (error) {
        console.error(error.message)
    }
}

async function processPublishData(data) {
    return {
        "name": `${data.title}`,
        "description": `${data.description}`,
        "author": `${data.author}`,
        "license": "public",
        "copyrightHolder": `${data.copyright}`,
        "price": "0",
        "type": "public",

        "files": await Promise.all(data.files.map(file, index => {
            return {
                "index": index,
                "contentType": file.fileType,
                "url": file.url
            }
        })),
        "categories": "",
        "tags": `${data.tags}`
    }

}

module.exports = { publish }