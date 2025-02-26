"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  PlusIcon, 
  Loader2Icon, 
  FileTextIcon, 
  PillIcon,  // Changed from PillsIcon
  SearchIcon, 
  StoreIcon, 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PackageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CreateReportModal,
  type ReportData,
} from "@/components/reports/create-report-modal";
import { ReportCard } from "@/components/reports/report-card";
import { ReportDetailModal } from "@/components/reports/report-detail-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import Image from "next/image";

interface MedicinePrices {
  [medicine: string]: {
    [pharmacy: string]: {
      price: number;
      quantity: string;
      title: string;
    };
  };
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"Reports" | "Buy Medicines">(
    "Reports"
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [editingReport, setEditingReport] = useState<ReportData | undefined>(
    undefined
  );
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<
    string | null
  >(null);
  const [medicines, setMedicines] = useState<string[]>([]);
  const [medicinePrices, setMedicinePrices] = useState<MedicinePrices | null>(null);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch("/api/reports");
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  }, []);

  const fetchPrescriptions = useCallback(async () => {
    try {
      const response = await fetch("/api/prescriptions");
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchPrescriptions();
  }, [fetchReports, fetchPrescriptions]);

  const handleSave = async (data: ReportData) => {
    try {
      if (editingReport) {
        const response = await fetch(`/api/reports/${editingReport._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.title,
            filename: data.filename,
            description: data.description,
            imageUrl: data.imageUrl,
          }),
        });
        if (response.ok) {
          await fetchReports();
          setEditingReport(undefined);
        } else {
          console.error("Failed to update report:", await response.text());
        }
      } else {
        const response = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.title,
            filename: data.filename,
            description: data.description,
            imageUrl: data.imageUrl,
          }),
        });
        if (response.ok) {
          await fetchReports();
        } else {
          console.error("Failed to create report:", await response.text());
        }
      }
    } catch (error) {
      console.error("Failed to save report:", error);
    }
    setIsCreateModalOpen(false);
  };

  const handleEdit = (report: ReportData) => {
    setEditingReport(report);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (reportId: string) => {
    setDeletingReportId(reportId);
  };

  const confirmDelete = async () => {
    if (deletingReportId) {
      try {
        const response = await fetch(`/api/reports/${deletingReportId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          await fetchReports();
        }
      } catch (error) {
        console.error("Failed to delete report:", error);
      }
      setDeletingReportId(null);
    }
  };

  const handlePrescriptionSelect = (prescriptionId: string) => {
    setSelectedPrescriptionId(prescriptionId);
    const selectedPrescription = prescriptions.find(
      (p) => p.prescriptionId === prescriptionId
    );
    if (selectedPrescription) {
      setMedicines(selectedPrescription.medicine_names);
    } else {
      setMedicines([]);
    }
  };

  const formatPrescriptionId = (id: string) => {
    const [doctor, timestamp] = id.split('_');
    const date = new Date(timestamp);
    return `${doctor} - ${date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })} at ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const fetchMedicinePrices = async () => {
    setIsFetchingPrices(true);
    try {
      const response = await fetch("https://webscrapper-965346204364.asia-south1.run.app/search-medicines", {
      // const response = await fetch("http://127.0.0.1:8080/search-medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ medicines }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMedicinePrices(data);
      }
    } catch (error) {
      console.error("Failed to fetch medicine prices:", error);
    } finally {
      setIsFetchingPrices(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b">
        <button
          className={`px-6 py-3 flex items-center gap-2 transition-colors ${
            activeTab === "Reports"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("Reports")}
        >
          <FileTextIcon className="h-5 w-5" />
          Reports
        </button>
        <button
          className={`px-6 py-3 flex items-center gap-2 transition-colors ${
            activeTab === "Buy Medicines"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("Buy Medicines")}
        >
          <PillIcon className="h-5 w-5" />
          Buy Medicines
        </button>
      </div>

      {activeTab === "Reports" && (
        <>
          <div className="flex items-center justify-between">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="mr-2 h-5 w-6" />
              Create
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={setSelectedReport}
              />
            ))}
          </div>
        </>
      )}

      {activeTab === "Buy Medicines" && prescriptions.length > 0 && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
              Select Prescription
            </h2>
            <Select
              value={selectedPrescriptionId || undefined}
              onValueChange={(value) => handlePrescriptionSelect(value)}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4 text-gray-500" />
                  {selectedPrescriptionId 
                    ? formatPrescriptionId(selectedPrescriptionId)
                    : "Select Prescription"}
                </div>
              </SelectTrigger>
              <SelectContent>
                {prescriptions
                  .filter((prescription) => prescription.prescriptionId)
                  .filter((prescription, index, self) => 
                    index === self.findIndex((p) => p.prescriptionId === prescription.prescriptionId)
                  )
                  .sort((a, b) => {
                    const [, timestampA] = a.prescriptionId.split('_');
                    const [, timestampB] = b.prescriptionId.split('_');
                    return new Date(timestampB).getTime() - new Date(timestampA).getTime();
                  })
                  .map((prescription, index) => (
                    <SelectItem
                      key={`${prescription.prescriptionId}_${index}`}
                      value={prescription.prescriptionId}
                    >
                      {formatPrescriptionId(prescription.prescriptionId)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPrescriptionId && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PackageIcon className="h-5 w-5 text-blue-500" />
                  Prescribed Medicines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {medicines.map((medicine, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <PillIcon className="h-4 w-4 text-blue-500" />
                        <p className="font-medium text-gray-800">{medicine}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={fetchMedicinePrices}
                  disabled={isFetchingPrices}
                  className="mt-6 w-full sm:w-auto"
                  size="lg"
                >
                  {isFetchingPrices ? (
                    <>
                      <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                      Fetching Prices...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="mr-2 h-5 w-5" />
                      Compare Prices
                    </>
                  )}
                </Button>
              </div>

              {medicinePrices && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <StoreIcon className="h-6 w-6 text-blue-500" />
                    Price Comparison
                  </h3>
                  <div className="grid gap-6">
                    {Object.entries(medicinePrices).map(([medicine, prices]) => (
                      <MedicinePriceCard
                        key={medicine}
                        medicineName={medicine}
                        prices={prices}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "Buy Medicines" && prescriptions.length === 0 && (
        <div className="text-center py-12">
          <PillIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No prescriptions available.</p>
          <p className="text-gray-500 mt-2">Visit a doctor to get prescriptions.</p>
        </div>
      )}

      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingReport(undefined);
        }}
        onSave={handleSave}
        initialData={editingReport}
      />

      <ReportDetailModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      <AlertDialog
        open={!!deletingReportId}
        onOpenChange={() => setDeletingReportId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this report?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              report and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const MedicinePriceCard = ({ medicineName, prices }: { medicineName: string, prices: any }) => {
  const getPharmacyIcon = (pharmacy: string) => {
    return `/images/pharmacies/${pharmacy}.png`;
  };

  const getPharmacyUrl = (pharmacy: string, medicine: string) => {
    const encodedMedicine = encodeURIComponent(medicine);
    switch(pharmacy) {
      case 'apollo_pharmacy':
        return `https://www.apollopharmacy.in/search-medicines/${encodedMedicine}`;
      case 'tata_1mg':
        return `https://www.1mg.com/search/all?name=${encodedMedicine}`;
      case 'netmeds':
        return `https://www.netmeds.com/catalogsearch/result/${encodedMedicine}/all`;
      case 'pharmeasy':
        return `https://pharmeasy.in/search/all?name=${encodedMedicine}`;
      default:
        return '#';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 transition-shadow hover:shadow-xl">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
        <PillIcon className="h-5 w-5 text-blue-500" />
        {medicineName}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(prices).map(([pharmacy, details]: [string, any]) => (
          <a
            key={pharmacy}
            href={getPharmacyUrl(pharmacy, medicineName)}
            target="_blank"
            rel="noopener noreferrer"
            className="group border rounded-lg p-4 hover:border-blue-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                <Image
                  src={getPharmacyIcon(pharmacy)}
                  alt={pharmacy}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="text-lg font-medium capitalize group-hover:text-blue-600 transition-colors">
                {pharmacy.replace('_', ' ')}
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600 mb-2">
              ₹{details.price}
            </p>
            <p className="text-sm font-medium text-gray-700">{details.title}</p>
            <p className="text-sm text-gray-500 mt-1">{details.quantity}</p>
          </a>
        ))}
      </div>
    </div>
  );
};
