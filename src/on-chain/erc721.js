import dotenv from 'dotenv';
dotenv.config();
import ethers from 'ethers';

const PROVIDER_ENDPOINT = process.env.PROVIDER_ENDPOINT;
const CHAIN_ID = +process.env.CHAIN_ID;

function getContract(address) {
    const provider = new ethers.providers.JsonRpcProvider(PROVIDER_ENDPOINT, CHAIN_ID);
    const abi = ["function ownerOf (uint256) view returns (address)"];
    return new ethers.Contract(address, abi, provider);
}

// options
// {
//     name: string,
//     address: string,
//     include: number[]?
//     startIndex: number?,
//     endIndex: number?,
// }
export async function getErc721Assets(options) {
    const contract = getContract(options.address);
    const assets = [];

    if (options.include) {
        for (const index of options.include) {
            try {
                assets.push(await getErc721Owner(contract, index));
            } catch(err) {
                console.error(`Token ${id} Error:`);
                console.error(err.reason);
                continue;
            }
        }
    } else {
        for (let index = (options.startIndex ?? 1); index <= (options.endIndex ?? 20000); index++) {
            try {
                assets.push(await getErc721Owner(contract, index));
                
            } catch (err) {
                if (err && err.reason && err.reason.includes('nonexistent token')) {
                    console.log(`auto-detected end of collection at index ${index-1}.`);
                    break;
                } else {
                    console.error(`Token ${index} Error:`);
                    console.error(err.reason);
                    continue;
                }
            }
        }
    }

    return {
        name: options.name,
        assets
    };
}

async function getErc721Owner(contract, index) {
    console.log(`Getting data for ${index}...`);
    return {
        id: index,
        owner: await contract.ownerOf(index),
    }
}
