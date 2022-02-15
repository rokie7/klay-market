import axios from "axios";
import { COUNT_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } from "../constants";

const A2P_API_PREPARE_URL = "https://a2a-api.klipwallet.com/v2/a2a/prepare";
const APP_NAME = "KLAY_MARKET";
const isMobile = window.screen.width >= 1280 ? false : true;

const getKlipAccessUrl = (method, request_key) => {
    //WEB
    if(method ==='QR'){
        return `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

    }
    //iOS , ANDROID
    return `kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

}
//NFT구입
export const buyCard = async (tokenID, setQrvalue,callback) => {
    
    //buyNFT abi
    const functionJSON = '{ "constant": false, "inputs": [ { "name": "tokenId", "type": "uint256" }, { "name": "NFTAddress", "type": "address" } ], "name": "buyNFT", "outputs": [ { "name": "", "type": "bool" } ], "payable": true, "stateMutability": "payable", "type": "function" }';
    
    executeContract(MARKET_CONTRACT_ADDRESS,functionJSON,"10000000000000000",`[\"${tokenID}\",\"${NFT_CONTRACT_ADDRESS}\"]`,setQrvalue,callback);

};

//마켓 등록
export const listingCard = async (fromAddress, tokenID, setQrvalue,callback) => {
    
    //safeTransferFrom abi
    const functionJSON = '{ "constant": false, "inputs": [ { "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" } ], "name": "safeTransferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }';
    console.log(`toAddress : ${fromAddress} ,tokenID : ${tokenID} `);
    executeContract(NFT_CONTRACT_ADDRESS,functionJSON,"0",`[\"${fromAddress}\",\"${MARKET_CONTRACT_ADDRESS}\",\"${tokenID}\"]`,setQrvalue,callback);

};

//nft발행
export const mintCardWithURI = async (toAddress, tokenID, uri, setQrvalue,callback) => {

    //mintWithTokenURI abi
    const functionJSON = '{ "constant": false, "inputs": [ { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" }, { "name": "tokenURI", "type": "string" } ], "name": "mintWithTokenURI", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }';
    console.log(`toAddress : ${toAddress} ,tokenID : ${tokenID} , uri : ${uri}`);
    executeContract(NFT_CONTRACT_ADDRESS,functionJSON,"0",`[\"${toAddress}\",\"${tokenID}\",\"${uri}\"]`,setQrvalue,callback);

};


export const executeContract = (txTo, functionJSON, value, params, setQrvalue,callback) => {
    axios.post( A2P_API_PREPARE_URL,{
            bapp: {
                name : APP_NAME
            },
            type : "execute_contract",
            transaction : {
                to: txTo ,
                abi: functionJSON,
                value: value,
                params : params

            }
        }
    ).then((response) => {
        const {request_key} = response.data;
        
        if(isMobile) {
            window.location.href = getKlipAccessUrl("android",request_key);
        }else {
            setQrvalue(getKlipAccessUrl("QR",request_key));
        }

        //const qrcode = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
        //setQrvalue(qrcode);
        //매초마다 결과값을 가져오기를 한다음에 결과값을 가져오면 멈추기(clear)
        let timerId = setInterval(()=> {
            axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`).then((res) => {
                if (res.data.result) {
                    console.log(`[Result] ${JSON.stringify(res.data.result)}`);
                    callback(res.data.result);
                    if(res.data.result.status == 'success') {
                        clearInterval(timerId);
                        console.log('executeContract success ');
                    }
                    if(res.data.result.status == 'fail') {
                        clearInterval(timerId);
                        console.log('executeContract fail ');
                    }
                    setQrvalue("DEFAULT");
                }

            });
        },1000);
    });


};




export const getAddress = (setQrvalue, callback) => {
    axios.post(A2P_API_PREPARE_URL,{
            bapp: {
                name : APP_NAME
            },
            type : "auth"       //주소가져올때는 auth
        }
    ).then((response) => {
        const {request_key} = response.data;
        if(isMobile) {
            window.location.href = getKlipAccessUrl("android",request_key);
        }else {
            setQrvalue(getKlipAccessUrl("QR",request_key));
        }
        //매초마다 결과값을 가져오기를 한다음에 결과값을 가져오면 멈추기(clear)
        let timerId = setInterval(()=> {
            axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`).then((res) => {
                if (res.data.result) {
                    console.log(`[Result] ${JSON.stringify(res.data.result)}`);
                    callback(res.data.result.klaytn_address);
                    clearInterval(timerId);
                    setQrvalue("DEFAULT");
                }

            });
        },1000);
    });
};


/*
export const setCount = (count, setQrvalue) => {
    axios.post( A2P_API_PREPARE_URL,{
            bapp: {
                name : APP_NAME
            },
            type : "execute_contract",
            transaction : {
                to: COUNT_CONTRACT_ADDRESS ,
                abi: '{ "constant": false, "inputs": [ { "name": "_count", "type": "uint256" } ], "name": "setCount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }',
                value: "0",
                params : `[\"${count}\"]`

            }
        }
    ).then((response) => {
        const {request_key} = response.data;
        const qrcode = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
        setQrvalue(qrcode);
        //매초마다 결과값을 가져오기를 한다음에 결과값을 가져오면 멈추기(clear)
        let timerId = setInterval(()=> {
            axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`).then((res) => {
                if (res.data.result) {
                    console.log(`[Result] ${JSON.stringify(res.data.result)}`);
                    
                    if(res.data.result.status == 'success') {
                        clearInterval(timerId);
                    }
                }

            });
        },1000);
    });
};
*/