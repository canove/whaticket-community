import React, { useEffect } from "react";

import MainContainer from "../../components/MainContainer";

import { BodyWidget } from './components/BodyWidget.jsx'; 
import { Application } from './Application';

import { Button } from "@material-ui/core";

const app = new Application();

const saveTeste = '{"id":"0530a9ad-227e-489d-82d6-c1c3400225f2","offsetX":0,"offsetY":0,"zoom":100,"gridSize":0,"layers":[{"id":"65762949-681d-4ccb-b53c-53f6b45a632c","type":"diagram-links","isSvg":true,"transformed":true,"models":{"0db3e26b-f010-4140-9229-c5e168a3e534":{"id":"0db3e26b-f010-4140-9229-c5e168a3e534","type":"advanced","selected":true,"source":"a2acb3ab-3eda-4dcd-a78b-de707d97e871","sourcePort":"294de534-921a-4cb2-80fe-9f41fc2efa85","target":"765e36fd-2702-4ee8-b4e9-9e403bd0773f","targetPort":"9529246b-8981-43fc-9768-dbd564c75984","points":[{"id":"2b8779db-4dbf-4efd-8f09-60eee4108ae6","type":"point","x":517,"y":198.98333740234375},{"id":"16d53249-e492-463c-bea6-6915f2b6eb86","type":"point","x":698.5,"y":107.58334350585938}],"labels":[],"width":4,"color":"gray","curvyness":50,"selectedColor":"rgb(0,192,255)"}}},{"id":"a55b50c5-98d2-4a03-8d0b-86fc4ff39799","type":"diagram-nodes","isSvg":false,"transformed":true,"models":{"a2acb3ab-3eda-4dcd-a78b-de707d97e871":{"id":"a2acb3ab-3eda-4dcd-a78b-de707d97e871","type":"chat-node","x":294,"y":77.98333740234375,"ports":[{"id":"294de534-921a-4cb2-80fe-9f41fc2efa85","type":"advanced","x":492,"y":173.98333740234375,"name":"out-true","parentNode":"a2acb3ab-3eda-4dcd-a78b-de707d97e871","links":["0db3e26b-f010-4140-9229-c5e168a3e534"]},{"id":"bfda5b7f-c75b-4276-838f-6baf3748f573","type":"advanced","x":492,"y":223.98333740234375,"name":"out-false","parentNode":"a2acb3ab-3eda-4dcd-a78b-de707d97e871","links":[]}],"color":{"options":"red"},"data":{}},"765e36fd-2702-4ee8-b4e9-9e403bd0773f":{"id":"765e36fd-2702-4ee8-b4e9-9e403bd0773f","type":"default","x":689,"y":70.98333740234375,"ports":[{"id":"9529246b-8981-43fc-9768-dbd564c75984","type":"default","x":691,"y":100.08334350585938,"name":"In","alignment":"left","parentNode":"765e36fd-2702-4ee8-b4e9-9e403bd0773f","links":["0db3e26b-f010-4140-9229-c5e168a3e534"],"in":true,"label":"In"}],"name":"Node 2","color":"rgb(192,255,0)","portsInOrder":["9529246b-8981-43fc-9768-dbd564c75984"],"portsOutOrder":[]}}}]}';

const CreateFlows = () => {
  const saveFlow = () => {
    const save = JSON.stringify(app.getActiveDiagram().serialize());
    console.log(save);
  }

  const loadFlow = () => {
    app.getActiveDiagram().deserializeModel(JSON.parse(saveTeste), app.getDiagramEngine());
		app.getDiagramEngine().setModel(app.getActiveDiagram());
  }

  return (
    <MainContainer>
      <Button onClick={saveFlow}>Salvar</Button>
      <Button onClick={loadFlow}>Carregar</Button>
      <BodyWidget app={app} />
    </MainContainer>
  );
};

export default CreateFlows;
