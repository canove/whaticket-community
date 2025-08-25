import Distribution from "../../models/Distribution";


const ListDistributionService = async ({ queueId }: { queueId?: number } = {}) => {
  if (queueId) {
    const distributions = await Distribution.findOne({ where: { queueId } });
    return distributions;
  }
  const distributions = await Distribution.findAll();
  return distributions;
};

export default ListDistributionService;
