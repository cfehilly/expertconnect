exports.handler = async (event, context) => {
  console.log("Function was triggered!");

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Upload received!" }),
  };
};
