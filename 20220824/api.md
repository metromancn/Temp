# Post Service API

The Post Service is a Gettr Core BE native service. The service implements post related functionalities.

## Edit Vision

The API is to modify a vision's text and cover. It is limited to editing the `txt` and the `main` field ONLY. The edition is restricted to the owner of the post ONLY.

**IMPORTANT NOTES TO FRONT END**
1. If user mentions are changed in the text, it is the front end's responsibility to update the `utags` field to include the updated user Ids.
2. If an url is changed, the url meta needs to be updated at front end and included in the payload of the request. 
3. If the url is removed from the post, the url meta also needs to be removed. To remove url meta, front end MUST include all url meta
properties in the request payload and set them to `null`.

**After Vision Modification**
1. The updated vision will undergo post-moderation again.
2. All the users included in `utags` field will be notified about the change of the vision.

**Limitations**
1. Only the following post types are supported:
   1. `vi_pst`

**URL** : `/u/post/v2/change/vision`

**Method** : `POST`

**Since** : `4.4.3`

**Auth required** : YES

**Auth type** : JWT

**Permissions required** : Active Gettr User

### Headers

| Header     | Type      | Mandatory | Description                                                                                                                                          |
|------------|-----------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| x-app-auth | `string`  | Yes       | The header that includes the user's user token. For details regarding user authentication, please refer to [Authentication](../../authentication.md) |

### Path Variables

This API does not use any path variables.

### Query Params

This API does not use any query params.

### Request Body

Any payload that is to be included in the request body needs to be wrapped within a json object named `content` as per [Gettr RESTFUL API Conventions]().

| Supported Properties | Type       | Mandatory | Description                                                                                                                               |
|----------------------|------------|-----------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `postId`             | `string`   | Yes       | The post ID to be modified.                                                                                                               |
| `txt`                | `string`   | Yes       | The changed text content.                                                                                                                 |
| `main`                | `string`   | Yes       | The changed cover image url.                                                                                                                 |
| `prevsrc`            | `string`   | No        | The preview source url. Only needed if url meta is changed.                                                                               |
| `previmg`            | `string`   | No        | The preview image of the url. Only needed if url meta is changed.                                                                         |
| `ttl`                | `string`   | No        | The title of the url. Only needed if url meta is changed.                                                                                 |
| `dsc`                | `string`   | No        | The description of the url. Only needed if url meta is changed.                                                                           |
| `utgs`               | `[string]` | No        | The user mentions. Only needed if user mentions is changed.                                                                               |
| `incl`               | `string`   | No        | The `incl` option controls what types of data to be preloaded while composing the result data. [`incl` options](../../include_options.md) |

#### Request Body Example

```json
{
  "content": {
     "postId": "p1rxabb1", 
     "txt": "changed",
     "main": "group/path/name.jpg",
     "prevsrc": "www.url.com/name.html",
     "previmg": "www.url.com/name.jpg",
     "ttl": "ttl",
     "dsc": "dsc",
     "utgs": ["userId1", "userId2"],
     "incl": "userinfo|postinfo"
  }
}
```

### Rate Limit

| Rate Limit Configuration | Value                 |
|--------------------------|-----------------------|
| Global Config Parameter  | `l_edit_vision_per_min` |
| Default limit            | `60`                  |
| Default window size      | `60`s                 |
| Rate limit by key        | `userId`              |


### Success Response

**Condition** : If everything is OK and an Account didn't exist for this User.

**Code** : `200 OK`

**Content example**

Example response queried by the sample request body above.

```json
{
   "_t":"xresp",
   "rc":"OK",
   "result":{
      "data":{
         "udate":1660493546179,
         "acl":{
            "pub":4,
            "_t":"acl"
         },
         "_t":"post",
         "cdate":1660493546179,
         "_id":"p1rxabb1",
         "txt":"changed",
         "main":"group21/getter/2022/08/14/16/ed641474-60db-5977-72a6-21350081bf5c/467e964ea120fcd7769d04eb9f13e667.jpg",
         "vid_dur":"20",
         "vid_wid":"352",
         "vid_hgt":"640",
         "vid":"group12/gvision/2022/08/14/16/a1114a10-2f55-fbe0-1899-b9daea9624f8/out.m3u8",
         "ovid":"group12/gvision/2022/08/14/16/a1114a10-2f55-fbe0-1899-b9daea9624f8/out.mp4",
         "utgs":[
            "larry"
         ],
         "vis":"p",
         "p_type":"vi_pst",
         "txt_lang":"en",
         "sound_ids":[
            
         ],
         "sticker_ids":[
            
         ],
         "uid":"larry",
         "lkbpst":29,
         "cm":12,
         "shbpst":4,
         "vfpst":445
      },
      "aux":{
         "shrdpst":null,
         "s_pst":{
            "lkbpst":29,
            "cm":12,
            "shbpst":4
         },
         "uinf":{
            "brjem":{
               "udate":1656793490940,
               "_t":"uinf",
               "_id":"larry",
               "nickname":"larry",
               "username":"larry",
               "ousername":"larry",
               "dsc":"dsc",
               "status":"a",
               "pinpsts":"[\"petjsh71de\"]",
               "cdate":1625491018230,
               "lang":"en",
               "ico":"group6/origin/2021/12/30/00/711ccb52-5793-ae35-4cb1-c3d95dca1775/8cd48b08e7fc75a73c02efc47bae2ca4.png",
               "bgimg":"group4/origin/2021/09/05/03/6b7881b5-820c-88d6-5524-bf8a81e3db87/056767d33551509d18f7648cd784b2cb.png",
               "xversion":"271210908",
               "flw":6981,
               "flg":8830
            }
         },
         "lks":[
            
         ],
         "shrs":[
            
         ]
      },
      "serial":"post"
   }
}
```

### Error Responses

**Condition** :
- If any of the mandatory properties are missing in the request body.

**Code** : `400 BAD REQUEST`

**Content** :
```json
{
    "_t": "xresp",
    "rc": "ERR",
    "error": {
        "_t": "xerr",
        "code": "E_BAD_PARAMS",
        "emsg": "",
        "args": []
    }
}
```
> Notes on the error message:
>* The actual value of error message (`emsg`) is subject to the actual error condition.
>* For full list of error codes, click [here](../../error_codes.md)

---

## Edit Post Text

The API is to modify a post's text field. It is limited to editing the `txt` field ONLY. The edition is restricted
to the owner of the post ONLY.

**IMPORTANT NOTES TO FRONT END**
1. If user mentions are changed in the text, it is the front end's responsibility to update the `utags` field to include the updated user Ids.
2. If an url is changed, the url meta needs to be updated at front end and included in the payload of the request. 
3. If the url is removed from the post, the url meta also needs to be removed. To remove url meta, front end MUST include all url meta
properties in the request payload and set them to `null`.

**After Post Modification**
1. The updated post will undergo post-moderation again.
2. All the users included in `utags` field will be notified about the change of the post.

**Limitations**
1. The following post types do not support edit post:
   1. `poll`

**URL** : `/u/post/v2/change/text`

**Method** : `POST`

**Since** : `4.4.3`

**Auth required** : YES

**Auth type** : JWT

**Permissions required** : Active Gettr User

### Headers

| Header     | Type      | Mandatory | Description                                                                                                                                          |
|------------|-----------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| x-app-auth | `string`  | Yes       | The header that includes the user's user token. For details regarding user authentication, please refer to [Authentication](../../authentication.md) |

### Path Variables

This API does not use any path variables.

### Query Params

This API does not use any query params.

### Request Body

Any payload that is to be included in the request body needs to be wrapped within
a json object named `content` as per [Gettr RESTFUL API Conventions]().

| Supported Properties | Type       | Mandatory | Description                                                                                                                               |
|----------------------|------------|-----------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `postId`             | `string`   | Yes       | The post ID to be modified.                                                                                                               |
| `txt`                | `string`   | Yes       | The changed text content.                                                                                                                 |
| `prevsrc`            | `string`   | No        | The preview source url. Only needed if url meta is changed.                                                                               |
| `previmg`            | `string`   | No        | The preview image of the url. Only needed if url meta is changed.                                                                         |
| `ttl`                | `string`   | No        | The title of the url. Only needed if url meta is changed.                                                                                 |
| `dsc`                | `string`   | No        | The description of the url. Only needed if url meta is changed.                                                                           |
| `utgs`               | `[string]` | No        | The user mentions. Only needed if user mentions is changed.                                                                               |
| `incl`               | `string`   | No        | The `incl` option controls what types of data to be preloaded while composing the result data. [`incl` options](../../include_options.md) |

#### Request Body Example

```json
{
  "content": {
     "postId": "p1rxabb1", 
     "txt": "changed",
     "prevsrc": "www.url.com",
     "previmg": "/sssss/jpg",
     "ttl": "ttl",
     "dsc": "dsc",
     "utgs": ["userId1", "userId2"],
     "incl": "userinfo|postinfo"
  }
}
```

### Rate Limit

| Rate Limit Configuration | Value    |
|--------------------------|----------|
| Global Config Parameter  | `N/A`    |
| Max Change Attempts      | `5`      |
| Change Window            | `1` hr   |

The rate limit for this API is not configurable but reach when either of the below conditions becomes true:
1. Reach max of `5` change attempts.
2. The original post is older than 1 hour.

### Success Response

**Condition** : If everything is OK and an Account didn't exist for this User.

**Code** : `200 OK`

**Content example**

Example response queried by the sample request body above.

```json
{
   "_t": "xresp",
   "rc": "OK",
   "result": {
      "data": {
         "udate": 1660823253682,
         "acl": {
            "_t": "acl"
         },
         "_t": "post",
         "cdate": 1660823253682,
         "_id": "pys29114d",
         "txt": "test",
         "utgs": [],
         "txt_lang": "en",
         "sound_ids": [],
         "sticker_ids": [],
         "uid": "live_wenxia"
      },
      "aux": {
         "shrdpst": null,
         "s_pst": {},
         "uinf": {
            "live_wenxia": {
               "udate": 1660707339865,
               "_t": "uinf",
               "_id": "live_wenxia",
               "nickname": "Live_wenxia",
               "username": "live_wenxia",
               "ousername": "live_wenxia",
               "dsc": "profile moderation is working now a",
               "status": "a",
               "pinpsts": "[]",
               "streaming": {},
               "cdate": 1638145448114,
               "lang": "en",
               "infl": "2",
               "ico": "group1/getter/2022/07/07/00/c07f25da-f68d-0328-1a16-eb06c6a536b7/63ccf4073f29e9fb3044c3c6b7ffc9a2.png",
               "bgimg": "group1/getter/2022/07/07/00/e26f3b48-7ede-45c4-e748-61925b5f626f/e8d2eb3ace719c9559aeef41b3e7813c.png",
               "location": "test test test",
               "website": "www.google.com",
               "twt_flg": "2",
               "twt_flw": "24",
               "claim_show_flw": "true",
               "claim_src": "tw",
               "xversion": "271210908",
               "flw": 282,
               "flg": 67
            }
         },
         "lks": [],
         "shrs": [],
         "pvotes": []
      },
      "serial": "post"
   }
}
```

### Error Responses

**Condition** :
- If any of the mandatory properties are missing in the request body.

**Code** : `400 BAD REQUEST`

**Content** :
```json
{
    "_t": "xresp",
    "rc": "ERR",
    "error": {
        "_t": "xerr",
        "code": "E_BAD_PARAMS",
        "emsg": "",
        "args": []
    }
}
```
> Notes on the error message:
>* The actual value of error message (`emsg`) is subject to the actual error condition.
>* For full list of error codes, click [here](../../error_codes.md)

---

## Poll Vote

This API is to vote in a [poll type post](./poll.md#poll-type-post). To vote in a poll, the
target poll type post must have a valid [poll object](./poll.md#poll-object) embedded.

**URL** : `/u/post/v2/vote`

**Method** : `POST`

**Since** : `4.4.0`

**Auth required** : YES

**Auth type** : JWT

**Permissions required** : Active Gettr User

### Headers

| Header     | Type      | Mandatory | Description                                                                                                                                          |
|------------|-----------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| x-app-auth | `string`  | Yes       | The header that includes the user's user token. For details regarding user authentication, please refer to [Authentication](../../authentication.md) |

### Path Variables

This API does not use any path variables.

### Query Params

This API does not use any query params.

### Request Body

Any payload that is to be included in the request body needs to be wrapped within
a json object named `content` as per [Gettr RESTFUL API Conventions]().

| Supported Properties | Type       | Mandatory | Description                                                                 |
|----------------------|------------|-----------|-----------------------------------------------------------------------------|
| postId               | `string`   | Yes       | The post ID which contains the poll.                                        |
| selections           | `[string]` | No        | The selections to vote. The selections size must be within range `(0, 10]`. |

> For users to vote multiple selections, the poll must have `multi` set to true.
> 
> **IMPORTANT**:
> 
> Any vote request will firstly remove all user's previous selections. Hence, it is an **override** operation.

#### Request Body Example

```json
{
  "content": {
    "postId": "p1rxabb1",
    "selections": [0]
  }
}
```

### Rate Limit

| Rate Limit Configuration | Value                 |
|--------------------------|-----------------------|
| Global Config Parameter  | `l_poll_vote_per_min` |
| Default limit            | `60`                  |
| Default window size      | `60`s                 |
| Rate limit by key        | `userId`              |


### Success Response

**Condition** : If everything is OK and an Account didn't exist for this User.

**Code** : `200 OK`

**Content example**

Example response queried by the sample request body above.

```json
{
  "_t": "xresp",
  "rc": "OK",
  "result": true
}
```

### Error Responses

**Condition** :
- If any of the mandatory properties are missing in the request body.

**Code** : `400 BAD REQUEST`

**Content** :
```json
{
    "_t": "xresp",
    "rc": "ERR",
    "error": {
        "_t": "xerr",
        "code": "E_BAD_PARAMS",
        "emsg": "",
        "args": []
    }
}
```
> Notes on the error message:
>* The actual value of error message (`emsg`) is subject to the actual error condition.
>* For full list of error codes, click [here](../../error_codes.md)

---

## Poll Unvote

This API is to unvote in a [poll type post](./poll.md#poll-type-post). To vote in a poll, the
target poll type post must have a valid [poll object](./poll.md#poll-object) embedded.

**URL** : `/u/post/v2/unvote`

**Method** : `POST`

**Since** : `4.4.0`

**Auth required** : YES

**Auth type** : JWT

**Permissions required** : Active Gettr User

### Headers

| Header     | Type      | Mandatory | Description                                                                                                                                          |
|------------|-----------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| x-app-auth | `string`  | Yes       | The header that includes the user's user token. For details regarding user authentication, please refer to [Authentication](../../authentication.md) |

### Path Variables

This API does not use any path variables.

### Query Params

This API does not use any query params.

### Request Body

Any payload that is to be included in the request body needs to be wrapped within
a json object named `content` as per [Gettr RESTFUL API Conventions]().

| Supported Properties | Type       | Mandatory | Description                                                                 |
|----------------------|------------|-----------|-----------------------------------------------------------------------------|
| postId               | `string`   | Yes       | The post ID which contains the poll.                                        |

> The API will remove all previous user's selections in this poll.

#### Request Body Example

```json
{
  "content": {
    "postId": "p1rxabb1"
  }
}
```

### Rate Limit

| Rate Limit Configuration | Value                   |
|--------------------------|-------------------------|
| Global Config Parameter  | `l_poll_unvote_per_min` |
| Default limit            | `60`                    |
| Default window size      | `60`s                   |
| Rate limit by key        | `userId`                |


### Success Response

**Condition** : If everything is OK and an Account didn't exist for this User.

**Code** : `200 OK`

**Content example**

Example response queried by the sample request body above.

```json
{
  "_t": "xresp",
  "rc": "OK",
  "result": true
}
```

### Error Responses

**Condition** :
- If any of the mandatory properties are missing in the request body.

**Code** : `400 BAD REQUEST`

**Content** :
```json
{
    "_t": "xresp",
    "rc": "ERR",
    "error": {
        "_t": "xerr",
        "code": "E_BAD_PARAMS",
        "emsg": "",
        "args": []
    }
}
```
> Notes on the error message:
>* The actual value of error message (`emsg`) is subject to the actual error condition.
>* For full list of error codes, click [here](../../error_codes.md)