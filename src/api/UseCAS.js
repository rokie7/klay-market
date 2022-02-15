import axios from "axios";
import { ACCESS_KEY_ID, SECRET_ACCESS_KEY } from "../constants";


const option = {
    headers : {
        Authorization : "Basic "+ Buffer.from(ACCESS_KEY_ID+":"+ SECRET_ACCESS_KEY).toString("base64"),
        "x-chain-id": 8217,
        "content-type" : "application/json"


    }
}


// export const uploadAssetData = async () => {
//     const assetdata ={
//         file : 'file=@""'
//     }

//     try{
//         const response = await axios.post('https://metadata-api.klaytnapi.com/v1/metadata/asset',assetdata, option2);
//         console.log(`${JSON.stringify(response)}`);
//         return response.data.uri;
//     }catch(e) {
//         console.log(e);
//         return false;
//     }
// }



export const uploadMetaData = async (_imageUrl,_bookTitle,_boodUrl,_desc) => {
                                    //썸네일, 책이름, 책URL,설명

    
    /*IPFS 구현 start*/ 
    //to do
    //썸네일과 책pdf파일을 ipfs로 등록하여 cid를 얻는 부분 구현


    /*IPFS 구현 end*/ 

    const metadata = {
        metadata: {
            name: _bookTitle,   //책이름
            description: _desc, //책설명
            bookUrl : _boodUrl, //책URL
            image: _imageUrl    //썸네일
            }
    }

    try {
        const response = await axios.post('https://metadata-api.klaytnapi.com/v1/metadata',metadata, option);
        console.log(`${JSON.stringify(response)}`);
        return response.data.uri;
    } catch(e) {
        console.log(e);
        return false;
    
    }
}




// const option = {
//     headers: [
//       {
//         name:"Authorization",
//         value: "Basic "+ Buffer.from(ACCESS_KEY_ID+":"+ SECRET_ACCESS_KEY).toString("base64")
//         //value: "Basic S0FTS0RPS00wUU80R0ExTEc4N1ZVME02Ok5nanFOLUJ0S1VEa0VJUUFhcDZmRldOZjVvcHFYUmtwbDJZeE0yRXI="
//       },
//       {name:"x-chain-id",value: CHAIN_ID}
//     ]
  
//   }