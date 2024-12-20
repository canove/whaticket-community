const formatDate = (dateString) => {
  const date = new Date(dateString);

  const formattedDate = Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  const weekDayUpperCase =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return weekDayUpperCase;
};

export default formatDate;
