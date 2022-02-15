import axios from 'axios';
import Caver from 'caver-js';
//import CounterABI from '../abi/CounterABI.json';
import KIP17ABI from '../abi/KIP17TokenABI.json';
import MarketABI from '../abi/MarketABI.json';
import {COUNT_CONTRACT_ADDRESS,ACCESS_KEY_ID,SECRET_ACCESS_KEY,CHAIN_ID,NFT_CONTRACT_ADDRESS} from '../constants/index';

const option = {
    headers: [
      {
        name:"Authorization",
        value: "Basic "+ Buffer.from(ACCESS_KEY_ID+":"+ SECRET_ACCESS_KEY).toString("base64")
        //value: "Basic S0FTS0RPS00wUU80R0ExTEc4N1ZVME02Ok5nanFOLUJ0S1VEa0VJUUFhcDZmRldOZjVvcHFYUmtwbDJZeE0yRXI="
      },
      {name:"x-chain-id",value: CHAIN_ID}
    ]
  
  }
  
  
  const caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn",option));
 
  const NFTContract = new caver.contract(KIP17ABI, NFT_CONTRACT_ADDRESS);
  
  //caver.ipfs.setIPFSNode('localhost', 5001, true);



  export const fetchCardsOf = async (adress) => {

    //1.balanceOf -> 내가가진 전체 nft개수
    const  balance = await NFTContract.methods.balanceOf(adress).call();
    console.log(`NFT balance ${balance}`);
    
    //2.tokenOfOwnerByIndex -> 내가가진 NFT tokenID를 하나씩 가져온다. 
    // 0x70814F8dA1dFA290b69D636406634784D94D2508 , 0 --> 1006801
    // 0x70814F8dA1dFA290b69D636406634784D94D2508 , 1 --> 1006802
    const tokenIDs = [];

    //adress가 가지고 있는 nft의 토큰id를 0번째부터 가져온다.
    for(let i=0;i<balance;i++) {
      
      const id = await NFTContract.methods.tokenOfOwnerByIndex(adress,i).call();
      tokenIDs.push(id);
      console.log(`NFT id ${i} :   ${tokenIDs[i]} |`);
    }
    
    //3.tokenURI -> tokenID를 이용해서 tokenURI를 하나씩 가져온다.
    //JSON으로 된 uri에서 속성들을 추출하여 배열에 저장한다.
    const tokenInfos = [];
    for(let i=0;i<balance;i++) {
      const metadataUrl = await NFTContract.methods.tokenURI(tokenIDs[i]).call(); //metadata kas 주소
      const response = await axios.get(metadataUrl);  //JSON으로 실제메타데이터를 가져옴
      const uriJSON = response.data;
      console.log('-------JSON데이터start----------');
      console.log(`name_${i} : ${uriJSON.name}`);
      console.log(`description_${i} : ${uriJSON.description}`);
      console.log(`bookUrl${i} : ${uriJSON.bookUrl}`);
      console.log(`image_${i} : ${uriJSON.image}`);
 
      console.log('-------JSON데이터end----------');


      tokenInfos.push({
        name:uriJSON.name, 
        description: uriJSON.description,
        bookUrl : uriJSON.bookUrl,
        image : uriJSON.image
      });  
      //console.log(`NFT id ${i} :   ${tokenInfos[i]} |`);
    }

    //2번의 토큰id와 3번의 uri정보들을 nfts배열에 저장한다.
    const nfts = [];
    for(let i=0;i<balance;i++) {
      nfts.push({
        id : tokenIDs[i], 
        name : tokenInfos[i].name, 
        description: tokenInfos[i].description,
        bookUrl : tokenInfos[i].bookUrl,
        image :  tokenInfos[i].image
      });
    }
    console.log(nfts);
    return nfts;

  }


  export const getBalance =(address) => {
    return caver.rpc.klay.getBalance(address).then((response) =>{
      const balance = caver.utils.convertFromPeb(caver.utils.hexToNumberString(response));
      console.log('BALANCE : '+balance);
      return balance;
    })
  }


   //const CountContract = new caver.contract(CounterABI, COUNT_CONTRACT_ADDRESS);
   /*
  export const readCount = async () => {
    const  _count = await CountContract.methods.count().call();
    console.log(_count);
  }
  
  
  
  
  export const setCount = async (newCount) => {
  
    try {
      //사용할 account 설정

      
    const privatekey = '0x56120274f1464b78e713b56b36d68e39100a00910e62fb7e296c2091af78d8c7';
    const deployer = caver.wallet.keyring.createFromPrivateKey(privatekey);
    caver.wallet.add(deployer);
    // 스마트 컨트렉트 실행 트랙젝션 날리기
    // 결과확인
    const  receipt = await CountContract.methods.setCount(newCount).send({
      from : deployer.address, //address
      gas : "0x4bfd200"//
    });
    console.log(receipt);
    } catch(e) {
      console.log('ERROR_SET_COUNT : '+e);
    }
    
  }
  */
  