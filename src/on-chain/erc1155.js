import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';
import { setTimeoutAsync } from '../utils.js';

const MORALIS_TOKEN=process.env.MORALIS_TOKEN;


// options
// {
//     name: string,
//     address: string,
//     include: number[]?
//     startIndex: number?,
//     endIndex: number?,
// }
export async function getErc1155Assets(options) {
    const assets = [];

    if (options.include) {
        for (const index of options.include) {
            await setTimeoutAsync(300);
            try {
                const owners = await getErc1155Owners(options.address, index);
                assets.push(...owners);
            } catch (err) {
                console.log(`auto-detected end of collection at index ${id-1}.`);
                break;
            }
        }
    } else {
        for (let index = (options.startIndex ?? 1); index <= (options.endIndex ?? 20000); index++) {
            await setTimeoutAsync(300);
            try {
                const owners = await getErc1155Owners(options.address, index);
                assets.push(...owners);
            } catch (err) {
                console.log(`auto-detected end of collection at index ${index-1}.`);
                break;
            }
        }
    }

    return {
        name: options.name,
        assets
    };
}

async function getErc1155Owners(address, index) {
    console.log(`Getting data for ${index}...`);
    const url = `https://deep-index.moralis.io/api/v2/nft/${address}/${index}/owners?chain=eth&format=decimal`;
    const headers = {
        'Accept': 'application/json',
        'X-API-KEY': MORALIS_TOKEN,
        'Content-Type': 'application/json',
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const ownerQuery = await response.json();
    return ownerQuery.result.map(token => ({
        index,
        owner: token.owner_of   
    }));
}

