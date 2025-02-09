export const formatDate = (timeStamp: string): string => {
    const date = new Date(timeStamp);
    return date.toLocaleString();
  };