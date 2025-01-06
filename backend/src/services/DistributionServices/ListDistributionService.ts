import Distribution from "../../models/Distribution";

const ListDistributionService = async (queueId: number) => {  
  try {
    const distributions = await Distribution.findAll({
      where: { queue_id: queueId }
    });

    if (!distributions.length) {
      return [];
    }
    
    return distributions;
  } catch (error) {
    console.error("Erro ao listar distribuições:", error);
    throw new Error("Erro ao listar distribuições");
  }
};

export default ListDistributionService;
