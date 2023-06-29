# SOS

## Make New SOS

### Request

`POST /sos`

```json
  "location": "123.45,-44.32",
  "user": {
    "name": "John Doe",
    "birthDate": "2000/11/01",
    "height": "170",
    "weight": "68",
    "bloodType": "RH+A",
    "allergies": "Peanuts",
    "medications": "Medication A, medication B, ...",
    "medicalNotes": "Had a surgery X, Y, ...",
    "diseases": [1, 3]
  }
```

Attribute `location` should contain comma-separated latitude and longitude. Convert S on latitude and W in longitude to minus.

Attribute `diseases` should be a array of integer ids which are ids of the disease table.

### Response

```json
{
  "sosId": "33"
}
```

Attribute `sosId` is the id of the newly created row of the sos table.

## See Current SOS Situation

### Request

`GET /sos/:sos_id`

No request body.

### Response

```json
{
  "location": "123.45,-44.32",
  "patient": {
  "name": "John Doe",
  "birthDate": "2000/11/01",
  "height": "170",
  "weight": "68",
  "bloodType": "RH+A",
  "allergies": "Peanuts",
  "medications": "Medication A, medication B, ...",
  "medicalNotes": "Had a surgery X, Y, ...",
  "diseases": [1, 3]
  }
}
```

## Report My Location

### Request

`POST /sos/:sos_id/rescuer/location`

```json
{
  "location": "123.450033,-44.320595"
}
```

### Response

No response body.

## Accept Rescue ### Request

### Request

`POST /sos/:sos_id/rescuer/accept`

No request body.

### Response

No response body.

## Notify My Arrival

### Request

`POST /sos/:sos_id/rescuer/arrived`

No request body.

### Response

No response body.

## Notify the Situation is Over

### Request

`POST /sos/:sos_id/done`

No request body.

### Response

No response body.

## See Rescuers Status

### Request

`POST /sos/:sos_id/rescuers`

No request body.

### Response

```json
{
  "rescuerNum": 2,
  "closestRescuerDistance": 0.54,
  "done": false
}
```

Attribute `closestRescuerDistance` contains the distance in kilometer between patient and the closest rescuer. Note that it will contain negative number if there is no rescuer approaching to the scene.

# Disease

## Get a List of Diseases

### Request

`GET /disease?ids=1,3` (Get entire list if there's no parameter specified.)

No request body.

### Response

```json
{
  "diseases" : [
    {
      "id": 1,
      "title": "Disease A",
      "subtitle": "Subtitle ...",
      "description": "Description ...",
      "cases": [
        {
          "id": 1,
          "title": "",
          "subtitle": "",
        },
        {
          "id": 3,
          "title": "",
          "subtitle": "",
        },
        ...
      ]
    },
    ...
  ]
}
```

## Get Information of Specific Disease

### Request

`GET /disease/:disease_id`

No request body.

### Response

```json
{
  "id": 1,
  "title": "Disease A",
  "subtitle": "Subtitle ...",
  "description": "Description ...",
  "cases": [
    {
      "id": 1,
      "title": "",
      "subtitle": "",
    },
    {
      "id": 3,
      "title": "",
      "subtitle": "",
    },
    ...
  ]
}
```

# Case

## Get a List of Cases

### Request

`GET /case`

No request body.

### Response

```json
{
  "cases": [
    {
      "id": 1,
      "title": "Case A",
      "subtitle": "Subtitle ...",
      "overview": "Overview ...",
      "symptoms": [
        "Symptom 1",
        "Symptom 2",
        ...
      ],
      "causes": "Explanation about causes ...",
      "manual": [
        {
          "title": "Title ...",
          "description": "Descripption ...",
          "videoUrl": "https://www.youtube.com/watch?v=3Zchk6dhr2c"
        },
        {
          "title": "Title ...",
          "description": "Description ...",
          "videoUrl": "https://www.youtube.com/watch?v=3Zchk6dhr2c"
        },
        ...
      ]
    },
    ...
  ]
}
```

Attribute `videoUrl` contains a Youtube link in a format as same as specified in the example response.

## Get Information of Specific Case

### Request

`GET /case/:case_id`

No request body.

### Response

```json
{
  "id": 2,
  "title": "Case B",
  "subtitle": "Subtitle ...",
  "overview": "Overview ...",
  "symptoms": [
    "Symptom 1",
    "Symptom 2",
    ...
  ],
  "causes": "Explanation about causes ...",
  "manual": [
    {
      "title": "Title ...",
      "description": "Description ...",
      "videoUrl": "https://www.youtube.com/watch?v=3Zchk6dhr2c"
    },
    {
      "title": "Title ...",
      "description": "Description ...",
      "videoUrl": "https://www.youtube.com/watch?v=3Zchk6dhr2c"
    },
    ...
  ]
}
```
