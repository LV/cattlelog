# cattlelog
Animal tracking blockchain; built for StatsCan, Winner of Blockathon 2019.

## The Problem

> Statistics Canada conducts collaborative projects with its partners integrating statistical analysis and traceability of livestock data to support efficient responses to emergency situations such as disease outbreaks. Disease management response tools identify investigative priorities such as location, premises and animal(s), in near real time updates based on the characteristics of disease.

> Blockchain technology shows promise to manage animal traceability throughout the value chain in an open source format. A prototype solution that would allow parties to play with implementation such as logging animal movements and identifying what information they would share with others would serve as a launch point for exploring how industry partners could leverage blockchain

> **The challenge:** Design and build a prototype using blockchain technology to trace animal movements deterministically in near real time by location, including time stamps for every susceptible, infected, or recovered (depending on the nature of the disease, such as transmission characteristics and vectors) animal from birth to death. Ideally, a team will be able to show judges how provenance data is loaded to the blockchain and then extracted in front of a live audience, for example, by scanning a QR code or similar to see the provenance of a particular item.

## The solution

Cattlelog is an end to end blockchain technology based on Hyperledger Fabric meant to provide real-time information across the network of live stock. The technology is to provide the following about livestock across British Columbia:

- Real-time identification of root of disease outbreaks
- Correlation factors
- Identify affected samples

The network is also to comply with the [Livestock Disease Control Regulations Act of 1994](http://agriculture.vic.gov.au/agriculture/livestock/livestock-disease-control-regulations-2017) and other regulations.

Presentation can be found in *cattlelog.pptx*

The network defines the following:

**Participants**
`Farmer` `Slaughterer`

**Assets**
`Animal` `Field` `Farm` `Slaughterhouse`

**Transactions**
`AnimalDeparture` `AnimalArrival`

Each farmer owns a farm, and each farm contains multiple fields. Within these fields, there are animals of which are owned by a specific farmer.

Animals can be transferred between farmers, fields, or even slaughterhouses.

To submit a `AnimalDeparture` transaction:
```
{
  "$class": "com.cattlelog.AnimalDeparture",
  "fromField": "resource:com.cattlelog.Field#FIELD_1",
  "animal": "resource:com.cattlelog.Animal#ANIMAL_1",
  "from": "resource:com.cattlelog.Farm#FARM_1",
  "to": "resource:com.cattlelog.Farm#FARM_2"
}
```

Doing the following will move `ANIMAL_1` from `FIELD_1` at `FARM_1` to `FARM_2`.

Submitting a `AnimalArrival` transaction:
```
{
  "$class": "com.cattlelog.AnimalArrival",
  "arrivalField": "resource:com.cattlelog.Field#FIELD_2",
  "animal": "resource:com.cattlelog.Animal#ANIMAL_1",
  "from": "resource:com.cattlelog.Farm#FARM_1",
  "to": "resource:com.cattlelog.Farm#FARM_2"
}
```

This in turn will confirm the recipt of `ANIMAL_1` from `FARM_1` to `FIELD_2` at `FARM_2`.
