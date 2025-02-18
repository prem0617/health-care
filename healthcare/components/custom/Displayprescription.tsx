import { Prescription } from "@/app/appointments/page";
import React from "react";

const PrescriptionDisplay = ({
  prescription,
}: {
  prescription: Prescription;
}) => {
  return (
    <div className="w-80 p-4">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900">Diagnosis</h4>
          <p className="text-gray-600">{prescription.diagnosis}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Medications</h4>
          <div className="space-y-3 mt-2">
            {prescription.medications.map((med) => (
              <div key={med._id} className="p-3 rounded-md">
                <p className="font-medium text-gray-900">{med.name}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Dosage: {med.dosage}</p>
                  <p>Frequency: {med.frequency}</p>
                  <p>Duration: {med.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Prescribed on: {new Date(prescription.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDisplay;
