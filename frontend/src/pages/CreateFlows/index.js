import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import { Button } from "@material-ui/core";

import MainContainer from "../../components/MainContainer";

import * as SRD from '@projectstorm/react-diagrams';
import { BodyWidget } from './components/BodyWidget.jsx'; 
import { Application } from './Application';

import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import api from "../../services/api";

const app = new Application();

const CreateFlows = () => {
  const { flowId } = useParams();

  const saveFlow = async () => {
    const allLinks = app.getActiveDiagram().getLinks();
		for (const oneLink of allLinks) {
      oneLink.options.selected = false;

			if (!oneLink.options.selected && (!oneLink.targetPort || !oneLink.sourcePort)) {
				app.getActiveDiagram().removeLink(oneLink);
			}
		}

    const save = JSON.stringify(app.getActiveDiagram().serialize());

    // console.log(save);

    try {
      await api.put(`/flowsNodes/${flowId}`, { json: save });
      toast.success('Fluxo salvo com sucesso.');
    } catch (err) {
      toastError(err);
    }
  }

  useEffect(() => {
    const fetchFlow = async () => {
      try {
        const { data } = await api.get(`/flowsNodes/${flowId}`);

        if (data.json) {
          app.getActiveDiagram().deserializeModel(JSON.parse(data.json), app.getDiagramEngine());
          app.getDiagramEngine().setModel(app.getActiveDiagram());
        } else {
          app.newModel();
        }
      } catch (err) {
        toastError(err);
      }
    }

    fetchFlow();
  }, [flowId]);

  return (
    <MainContainer>
      <Button onClick={saveFlow}>Salvar</Button>
      <BodyWidget app={app} />
    </MainContainer>
  );
};

export default CreateFlows;
