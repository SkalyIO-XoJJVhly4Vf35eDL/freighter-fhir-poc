# FHIR-Freighter PoC

FHIR-Freighter shows a scenario of a healthcare provider and a patient exchanging data, with the option for the patient to withdraw consent (and have the healthcare provider scrub any data that is from the patient).

All of this happens on the Tangle and inherits the [HL7 FHIR](https://www.hl7.org/fhir/) standard, making sure that data is interopable between different organisations and systems.

This PoC is split into 2 demo's, each in their respective folder:

- [Dashboard/](./Dashboard)
    - The portal for the healthcare professional. The dashboard features a overview of patient channels and the ability to delete them from the patients side.

- [PatientApp/](./PatientApp)
    - The patient app is a web app that connects to the dashboard and shares (demo) patient data.

Both apps in the PoC are meant to be started in a separated tab in a modern browser to get the full experience.

# In-depth

The FHIR-Freighter PoC is based on the recently release FRPC technology, allowing anyone to contact anyone over the Tangle by establishing private Freighter channels.

To read more about FRPC, it's cryptography and inner workings, see the [FRPC readme](https://github.com/peterwilli/Freighter/blob/master/Library/FRPC_README.md).

# Launch the demo online

You can go to [fhir_patient.skaly.io](https://fhir_patient.skaly.io) for the patient demo and to [fhir_dashboard.skaly.io](https://fhir_dashboard.skaly.io). Note that you need both at the same time so make sure you open them in a separate tab next to eachother!

# Launch the demo locally

To launch the demo yourself, clone this repo and, assuming you have NodeJS, Yarn, you can simply run `yarn` followed by `yarn dev` in both folders. You will end up with a address `localhost:8080` and `localhost:8081` for both the dashboard and the patient web app.