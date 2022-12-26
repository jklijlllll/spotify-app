import { FunctionComponent, useState, useEffect } from "react";
import { Radar } from "react-chartjs-2";
import { LinearProgressWithLabel } from "../../Functions/LinearProgressWithLabel";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import "./TrackAttributes.css";

const TrackAttributes: FunctionComponent<{
  labels: string[];
  data: Map<string, number | string>;
  title: string;
}> = ({ labels, data, title }) => {
  ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    Title
  );

  const [sortedData, setSortedData] = useState<any[]>([]);

  useEffect(() => {
    const keyIterator = data.keys();
    let newData = [];
    while (true) {
      const x = keyIterator.next();
      if (x.done) break;

      if (
        typeof x.value === "string" &&
        labels.find((l) => l.toLowerCase() === x.value)
      )
        newData.push(data.get(x.value));
    }
    setSortedData(newData);
  }, [labels, data]);

  return (
    <div className="track_attributes_container">
      <div className="track_attributes_graph">
        <Radar
          data={{
            labels: labels,
            datasets: [
              {
                data: sortedData,
                backgroundColor: "rgba(30, 215, 96, 0.2)",
                borderColor: "rgba(30, 215, 96, 1 )",
                borderWidth: 1,
                pointHoverBackgroundColor: "rgba(30, 215, 96, 1 )",
                tension: 0,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            scales: {
              r: {
                pointLabels: {
                  display: true,
                  centerPointLabels: true,
                  font: {
                    size: 10,
                  },
                },
                min: 0,
                max: 1,
                ticks: {
                  font: {
                    size: 8,
                  },
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: title !== "",
                text: title,
                padding: {
                  bottom: -15,
                  top: 15,
                },
                font: {
                  size: 14,
                },
              },
            },
          }}
        />
      </div>
      <div className="track_attribute_flex">
        <h4 className="track_attribute_label">Loudness</h4>
        <div className="track_attribute_bar">
          <LinearProgressWithLabel
            value={
              data.get("loudness") ? (data.get("loudness") as number) : -60
            }
            min={-60}
            max={0}
            postFix={"dB"}
          />
        </div>

        <h4 className="track_attribute_label">Popularity</h4>
        <div className="track_attribute_bar">
          <LinearProgressWithLabel
            value={
              data.get("popularity") ? (data.get("popularity") as number) : 0
            }
            min={0}
            max={100}
          />
        </div>

        <h4 className="track_attribute_label" style={{ textAlign: "center" }}>
          Tempo: {data.get("tempo") ? (data.get("tempo") as string) : ""}
        </h4>
      </div>
    </div>
  );
};

export default TrackAttributes;
