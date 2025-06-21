import React from "react";
import { Pill, Clock, Calendar, FileText, AlertTriangle, User } from "lucide-react";

/**
 * @param {{ prescription: {
 *   diagnosis: string,
 *   medications: {
 *     _id: string,
 *     name: string,
 *     dosage: string,
 *     frequency: string,
 *     duration: string
 *   }[],
 *   createdAt: string
 * }}} props
 */
const PrescriptionDisplay = ({ prescription }) => {
  return (
    <div className="w-96 max-h-[500px] overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-emerald-500 text-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Prescription</h3>
            <p className="text-emerald-100 text-sm">
              {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Diagnosis */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Diagnosis</h4>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-emerald-500">
            <p className="text-gray-800 text-sm">{prescription.diagnosis}</p>
          </div>
        </div>

        {/* Medications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Medications</h4>
            </div>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {prescription.medications.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {prescription.medications.map((med, index) => (
              <div key={med._id} className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-900 mb-2 text-sm">{med.name}</h5>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-600 min-w-0">Dosage:</span>
                        <span className="text-gray-900 font-medium">{med.dosage}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        <span className="text-gray-600 min-w-0">Frequency:</span>
                        <span className="text-gray-900 font-medium">{med.frequency}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 min-w-0">Duration:</span>
                        <span className="text-gray-900 font-medium">{med.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-amber-800 font-medium mb-1">Important</p>
              <p className="text-xs text-amber-700">
                Take medications as prescribed. Contact your doctor if you experience any side effects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDisplay;