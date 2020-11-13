const fs= require("fs")
const path=require("path");
const jp = require('jsonpath');

const run = async ()=>{

    try {
        var datafile= await readFileContents(path.resolve("test.json"));
        var mapfile=await readFileContents(path.resolve("mapping.json"));
        let outarray=[];
        datafile.forEach(element => {
            let dataobj=new Object();
            transformMap(mapfile,element,dataobj);
            outarray.push(dataobj);
        });
    console.log(JSON.stringify(outarray))
        
    } catch(err) {
        console.log(err)
    }

};

let tempobj= new Object();
function transformMap(jsonSchema, sourceData,outObject,parent,isArray,arrayindex){
   
    Object.keys(jsonSchema).forEach(elementKeys=>{
        if(typeof jsonSchema[elementKeys]!=="object")
        {
            if(parent)
            {
                if(outObject[parent]==null)
                {
                    if(isArray)
                    {
                        outObject[parent]=[];
                    }
                    else
                    {
                        outObject[parent]=new Object();
                    }
                }
                if(isArray) {
                        tempobj[elementKeys]=jp.value(sourceData,(jsonSchema[elementKeys]).replace("*",arrayindex));
                }else {
                        outObject[parent][elementKeys]=jp.value(sourceData,jsonSchema[elementKeys]);
                }
            }
            else{
                outObject[elementKeys]=jp.value(sourceData,jsonSchema[elementKeys]);
            }
        }
        else
        {
            if(Array.isArray(jsonSchema[elementKeys]))
            {
                if(jsonSchema[elementKeys].length>0)
                {
                    var orginalItems=jp.query(sourceData,jsonSchema[elementKeys][0][Object.keys(jsonSchema[elementKeys][0])[0]]);
                    if(orginalItems<=0)
                    {
                        outObject[elementKeys]=[];
                    }
                    for(let i=0;i<orginalItems.length;i++)
                    {
                      transformMap(jsonSchema[elementKeys][0],sourceData,outObject,elementKeys,true,i);

                      if(outObject[elementKeys])
                      {
                          outObject[elementKeys].push(tempobj);
                          tempobj = new Object();
                      }
                    }
                }

            }else {
                transformMap(jsonSchema[elementKeys],sourceData,outObject,elementKeys);
            }
 
        }
    });
}

run();


function readFileContents(filepath){
    return new Promise((resolve,reject)=>{
        fs.readFile(filepath,(err,data)=>{
                if(err)
                {
                    console.log("Error "+err)
                    reject(err);
                }
                else
                    resolve(JSON.parse(data));
        });
    });
}
