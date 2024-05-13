const { json } = require("express");
// const redisClient  = require("../");
const { ObjectId } = require('mongodb');
module.exports = {

    createUSer: async (userData) => {
        try {
            console.log('user created ====',userData)
            if(userData.name){

                userData.id =  new ObjectId();
               const user = await redisClient.get('users:'+userData.id)
               console.log('user get data==',user)

                await redisClient.set('users:' + userData.id, JSON.stringify(userData));
               return  userData.id
            }
        } catch (error) {
            console.error('Error:', error);
        }
    },
       
    findAllUser: async () => {
        try {
            const keys = await redisClient.keys('*');

            const dataPromises = keys.map(async (key) => {
                const value = await redisClient.get(key);
                return { key, value };
            });
    
            // Wait for all data to be fetched
            const allData = await Promise.all(dataPromises);
            // console.log('all data name=',allData)
            return allData;
        } catch (error) {
            console.log("Error Of Find All User :--", error.message)
        }
    },

    findUser: async (data,userId) => {
        try {
            const {name,msg,receiver} = data
            const sender = await redisClient.get('users:'+userId)
            console.log('senderData=',sender)
            const receiverData = await redisClient.get('users:'+receiver)
            console.log('receiverData=',receiverData)

        } catch (error) {
            console.log(error);
        }
    },
    findName : async () =>{
        try {
            const keys = await redisClient.keys('users:*');

            const dataPromises = keys.map(async (key) => {
                const value = await redisClient.get(key);
                return { key, value };
            });
    
            // Wait for all data to be fetched
            const allData = await Promise.all(dataPromises);
            // console.log('all data name=',allData)
            return allData;
        } catch (error) {
            console.log("Error Of Find All User :--", error.message)
        }
    }
    // findChat: async () => {

    //     try {
    //         const result = await redisClient.hGetAll();
    //         console.log('controller result log===',result)
          
    //         return result;

    //     } catch (error) {
    //         console.log(error);
    //     }
    // }


} 