# CancerDB: A public domain csv file to help build a cure

## Launching November 1st, 2022

CancerDB is a public domain database and website containing facts about all types of cancers and structured information on things related to cancers and the quest for a cure.

Who knows, maybe we are just eight insights away from building a cure. CancerDB can help us figure out what those 8 missing insights are.

CancerDB is build for Cancer Researchers to help them build a cure. It is also built for those beautiful human beings affected by cancer and their loved ones. We want to provide you with the _absolute_ best data on cancer. We will deliver that information to you quickly, cheaply, and you will be able to trust it 100%.

This repo contains the entire database and website for https://cancerdb.com.

## To analyze the data

The CancerDB database will be freely available:

-   As CSV:
-   As JSON:

Documentation for the CSV will be available here: https://cancerdb.com/docs/csv.html.

## To add a new entity

Easy method: https://edit.cancerdb.com/create

Advanced method: Create a new file in `database/things` with a unique URL friendly filename ending in `.cancerdb` and send a pull request.

## To update an entity

Easy method: https://edit.cancerdb.com

Advanced method: Edit the corresponding `database/things/*.cancerdb` file and send a pull request.

## To add a new column

Advanced method: Edit or create a new file in `database/grammar` and add at least 1 example to an entity in `database/things` and send a pull request.

## To build the full site locally

```
git clone https://github.com/breck7/CancerDB
cd CancerDB
npm install .
npm run tsc
npm run build
open site/index.html
```

## To explore this repo

The most important folder is `database/things/`, which contains a file for each entity. The folder `database/grammar/` contains the grammar files (schema) for the database.

The website content is in the `site` folder.

## To cite CancerDB

CancerDB content is published to the public domain and you can use it freely. If needed, here are 3 options for citing PLDB:

```
https://cancerdb.com
```

```
Breck Yunits et al. (2022) - "CancerDB: A public domain csv file to help build a cure". Retrieved from: 'https://cancerdb.com' [Online Resource]
```

```
@article{pldb,
  author = {Breck Yunits et al.},
  title = {CancerDB: A public domain csv file to help build a cure},
  journal = {CancerDB},
  year = {2022},
  note = {https://cancerdb.com}
 }
```

## Funding

The budget for Year for CancerDB is $6,315. $6,195 was used to purchase CancerDB.com and we expect $120 in Digital Ocean server costs. Funding so far is provided from Breck Yunits. If you would like to contribute you can Buy Me a Coffee here: https://www.buymeacoffee.com/pldb.

All sources for CancerDB you will be able to find here: https://cancerdb.com/pages/acknowledgements.html
