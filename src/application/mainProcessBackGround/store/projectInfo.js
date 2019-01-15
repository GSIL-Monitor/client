const {GraphQLClient} = require('graphql-request');
const config = require('../../../config');

const http = new GraphQLClient(config.server.host, {
    credentials: "same-origin",
    headers: {
        ClientAuthorization: config.server.token
    }
})

class ProjectInfo {
    
    constructor() {

    }

    getCategoryAttribute() {
        const query = `{
            queryCategoryAttributeItemList(input:{
                attributeItemId:"",
                name:"",
                attributeType:"0"		
            }){
                attrName		
                attrId			
                state
                items{			
                    attrItemId
                    state
                    attrItemName
                }
            }
        }`
        return new Promise((reslove, reject) => {
            http.request(query).then(res => {
                console.log('RES', res);
                const items = res.queryCategoryAttributeItemList[0].items;
                if (items && items.length) {
                    reslove(items);
                } else {
                    reject(new Error('getCategoryAttribute type res: ', res));
                }
            }).catch(err => {
                console.log('ERROR', err);
                reject(err);
            })
        })
    }

    getProjectList() {
        const query = `{
            queryProjectList(attrItemId: "", projectName: "") {
                projectId
                projectName
                projectType
                bucketName
                time
                cover
                state
                createAt
                projectAttrItem {
                    attrItemName
                    attrItemId
                }		
            }
        }`
        return new Promise((reslove, reject) => {
            http.request(query).then(res => {
                const items = res.queryProjectList;
                if (items) {
                    reslove(items);
                } else {
                    reject(new Error('getProjectList res: ', res));
                }
            }).catch(err => {
                reject(err);
            })
        })
    }

    searchProjects(param) {
        const keyword = param.keyword || "";
        const categoryAttributeItemIds = param.categoryAttributeItemIds || [];
        const query = `{
            searchProjects(keyword: "${keyword}", categoryAttributeItemIds: ${JSON.stringify(categoryAttributeItemIds)}) {
                projectId
                projectName
                bucketName
                cover
                projectType
                time
                projectTypeAliases
            }
        }`
        return new Promise((reslove, reject) => {
            http.request(query).then(res => {
                const items = res.searchProjects;
                if (items) {
                    reslove(items);
                } else {
                    reject(new Error('searchProjects res: ', res));
                }
            }).catch(err => {
                reject(err);
            })
        })
    }

    addProject(param) {
        const query = `mutation {
            addProject(input: {
                name: "${param.name}",
                cover: "${param.cover}",
                time: "${param.time}",
                type: "${param.type}",
                categoryAttributeItemIds: ["${param.id}"]
            }) {
                ret
                msg
            }
        }`
        console.log('addProject', query);
        return new Promise((reslove, reject) => {
            http.request(query).then(res => {
                reslove(res);
            }).catch(err => {
                reject(err);
            })
        })
    }

    editProject({id, input}) {
        const query = `mutation {
            updateProject(id: "${id}", input: {
                name: "${input.name}",
                cover: "${input.cover}",
                time: "${input.time}",
                type: "${input.type}",
                categoryAttributeItemIds: ["${input.id}"]
            }) {
                ret
                msg
            }
        }`
        console.log('editProject', query);
        return new Promise((reslove, reject) => {
            http.request(query).then(res => {
                reslove(res);
            }).catch(err => {
                reject(err);
            })
        })
    }

    deleteProject(param) {
        const query = `mutation {
            delProject(projectId: "${param}") {
                ret
                msg
            }
        }`
        console.log('deleteProject', query);
        return new Promise((reslove, reject) => {
            http.request(query).then(res => {
                reslove(res);
            }).catch(err => {
                reject(err);
            })
        })
    }

    syncProject(param) {
        const query = `mutation {
            syncCosFile2Project(projectId: "${param}") {
                ret
                msg
            }
        }`
        console.log('syncProject', query);
        return new Promise((reslove, reject) => {
            http.request(query).then(res => {
                reslove(res);
            }).catch(err => {
                reject(err);
            })
        })
    }
}

module.exports = new ProjectInfo();