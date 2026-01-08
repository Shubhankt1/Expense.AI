import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function StatementUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState<Id<"_scheduled_functions"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.statements.generateUploadUrl);
  //   const processStatement = useAction(api.statements.processStatement);
  const processStatementMutation = useMutation(
    api.statements.processStatementMutation
  );
  const processedStatements = useQuery(api.statements.getProcessedStatements);

  const jobStatus = useQuery(
    api.utils.getJobStatus,
    jobId ? { jobId } : "skip"
  );

  // Monitor job completion and show success toast
  useEffect(() => {
    if (!jobStatus || !jobId) return;

    if (jobStatus.state.kind === "success") {
      setIsProcessing(false);
      setJobId(null);
      toast.success("Successfully processed the statement!");
    } else if (
      jobStatus.state.kind === "failed" ||
      jobStatus.state.kind === "canceled"
    ) {
      setIsUploading(false);
      setIsProcessing(false);
      setJobId(null);
      toast.error("Failed to process statement. Please try again.");
    }
  }, [jobStatus, jobId]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "text/csv",
      "text/plain",
      "application/pdf",
      "text/tab-separated-values",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(csv|txt|pdf|tsv)$/i)
    ) {
      toast.error("Please upload a CSV, TXT, PDF, or TSV file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      setIsUploading(false);
      setIsProcessing(true);

      // Step 3: Process the statement
      const id = await processStatementMutation({
        storageId,
        fileName: file.name,
      });

      setJobId(id);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process statement. Please try again.");
    } finally {
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          📄 Upload Credit Card Statement
        </h3>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
            <div className="space-y-4">
              <div className="text-4xl">📊</div>
              <div>
                <h4 className="text-lg font-medium text-slate-900 mb-2">
                  Upload Your Statement
                </h4>
                <p className="text-sm text-slate-600 mb-4">
                  Upload CSV, TXT, PDF, or TSV files. Our AI will automatically
                  extract and categorize transactions.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.pdf,.tsv"
                  onChange={handleFileUpload}
                  disabled={isUploading || isProcessing}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isProcessing}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading
                    ? "Uploading..."
                    : isProcessing
                      ? "Processing..."
                      : "Choose File"}
                </button>
              </div>
            </div>
          </div>

          {/* Processing Status */}
          {(isUploading || isProcessing) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <p className="font-medium text-blue-900">
                    {isUploading
                      ? "Uploading file..."
                      : "Analyzing statement with AI..."}
                  </p>
                  <p className="text-sm text-blue-700">
                    {isUploading
                      ? "Please wait while we upload your file."
                      : "This may take a few moments."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-medium text-slate-900 mb-2">
              📋 Supported Formats
            </h5>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>
                • <strong>CSV files:</strong> Exported from your bank or credit
                card website
              </li>
              <li>
                • <strong>PDF statements:</strong> Monthly statements
                (text-based, not scanned images)
              </li>
              <li>
                • <strong>TXT files:</strong> Plain text transaction exports
              </li>
              <li>
                • <strong>TSV files:</strong> Tab-separated transaction data
              </li>
            </ul>

            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                <strong>Privacy:</strong> Your files are processed securely and
                automatically deleted after analysis. We only extract
                transaction data to populate your expense tracker.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Uploads */}
      {processedStatements && processedStatements.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            📈 Recent Uploads
          </h3>

          <div className="space-y-3">
            {processedStatements.map((statement) => (
              <div
                key={statement._id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 text-sm">📄</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {statement.fileName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {statement.transactionCount} transactions extracted
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">
                    {new Date(statement._creationTime).toLocaleDateString()}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Processed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
