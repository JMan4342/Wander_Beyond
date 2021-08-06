import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getAlerts, getParkByCode } from "../utils/api";

export default function ParkDetail(props) {
  const params = useParams();
  const [park, setPark] = useState({});
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    // retrieve details about our specific park
    getParkByCode(params.parkCode).then(({ data }) => setPark(data[0]));
    // retrieving the alerts for our specific park
    getAlerts(params.parkCode).then(({ data }) => setAlerts(data));
  }, []);

  if (!park) {
    return <h1>Loading Park Data....</h1>;
  }

  return (
    <>
      <h1>{park.fullName}</h1>
      <p>{park.description}</p>
      <img src={park.images[0].url} alt={park.images[0].altText} />
    </>
  );
}
