import { aws4Interceptor } from "aws4-axios";

const getAxiosInterceptor = () => {
  const session = sessionStorage.getItem("AWSCred");
  if (!session) {
    return;
  }

  const awsCred = JSON.parse(session);

  if (awsCred.expiration.toLocaleString() < new Date().toLocaleString()) {
    sessionStorage.removeItem("AWSCred");
    return;
  }

  return aws4Interceptor(
    {
      region: "ap-south-1",
      service: "execute-api",
    },
    {
      accessKeyId: awsCred?.accessKeyId,
      secretAccessKey: awsCred?.secretAccessKey,
    }
  );
};

export default getAxiosInterceptor;
