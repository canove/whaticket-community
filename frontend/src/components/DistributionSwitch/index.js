import React, { useState, useEffect } from "react";
import Switch from "@material-ui/core/Switch";
import api from "../../services/api";
import toastError from "../../errors/toastError";

function DistributionSwitch({ queueId, name }) {
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const { data } = await api.get(`/distributions/${queueId}`);
        setDistribution(data);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDistribution();
  }, [queueId]);

  const handleChange = async (e) => {
    const value = e.target.checked;
    try {
      const { data } = await api.put(`/distributions/${queueId}`, { enabled: value });
      setDistribution(data);
    } catch (err) {
      toastError(err);
    }
  };

  if (loading) return <Switch disabled checked={false} />;

  return (
    <Switch
      checked={!!distribution?.isActive}
      onChange={handleChange}
      color="primary"
      name={name}
      inputProps={{ "aria-label": "toggle distribution" }}
    />
  );
}

export default DistributionSwitch;