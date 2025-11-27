"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Brain,
  FileText,
  CreditCard,
  Home,
  Users,
  Shield,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// Types
type TabType = "overview" | "details" | "history";

interface ScreeningResult {
  riskScore: number;
  recommendation: "APPROVE" | "DENY" | "REVIEW";
  confidence: number;
  reasoning: string[];
  redFlags: string[];
  screeningId: string;
  processedAt: string;
}

interface ScreeningHistory {
  id: string;
  riskScore: number;
  recommendation: string;
  processedAt: string;
}

interface ApplicantData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  creditScore?: number;
  annualIncome: number;
  monthlyIncome: number;
  employmentStatus: string;
  employmentYears: number;
  previousAddress: string;
  rentalHistory?: string;
  criminalHistory: boolean;
  evictionHistory: boolean;
  references?: string[];
  requestedRent: number;
}

export default function TenantScreening({ applicantId }: { applicantId: string }) {
  const [applicant, setApplicant] = useState<ApplicantData | null>(null);
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null);
  const [screeningHistory, setScreeningHistory] = useState<ScreeningHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Load applicant data
  useEffect(() => {
    loadApplicantData();
    loadScreeningHistory();
  }, [applicantId]);

  // Load applicant data from API
  const loadApplicantData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/tenants/${applicantId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch applicant data: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setApplicant(data.data);
      } else {
        throw new Error(data.error?.message || "Failed to load applicant data");
      }
    } catch (error) {
      console.error("Error loading applicant data:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load applicant data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load screening history
  const loadScreeningHistory = async () => {
    try {
      const response = await fetch(`/api/ai/screening/history?applicantId=${applicantId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch screening history: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setScreeningHistory(data.data || []);
      } else {
        throw new Error(data.error?.message || "Failed to load screening history");
      }
    } catch (error) {
      console.error("Error loading screening history:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load screening history");
    }
  };

  // Run AI screening analysis
  const runScreeningAnalysis = async () => {
    if (!applicant) return;

    try {
      setIsAnalyzing(true);

      const response = await fetch("/api/ai/screening", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicantId: applicant.id,
          creditScore: applicant.creditScore,
          annualIncome: applicant.annualIncome,
          monthlyIncome: applicant.monthlyIncome,
          employmentStatus: applicant.employmentStatus,
          employmentYears: applicant.employmentYears,
          previousAddress: applicant.previousAddress,
          rentalHistory: applicant.rentalHistory,
          criminalHistory: applicant.criminalHistory,
          evictionHistory: applicant.evictionHistory,
          references: applicant.references,
          requestedRent: applicant.requestedRent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to run screening: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setScreeningResult(data.data);
        toast.success("AI screening analysis completed");
      } else {
        throw new Error(data.error?.message || "Failed to run screening analysis");
      }
    } catch (error) {
      console.error("Error running screening analysis:", error);
      toast.error(error instanceof Error ? error.message : "Failed to run screening analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle approve/reject actions
  const handleApproval = async (decision: "APPROVE" | "DENY") => {
    if (!applicant) return;

    try {
      const newStatus = decision === "APPROVE" ? "APPROVED" : "DENIED";
      const statusMessage = `Your rental application has been ${decision.toLowerCase()}d.`;

      // Update tenant application status
      const statusResponse = await fetch(`/api/tenants/${applicantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          screeningId: screeningResult?.screeningId,
        }),
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to update application status: ${statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();
      if (!statusData.success) {
        throw new Error(statusData.error?.message || "Failed to update application status");
      }

      toast.success(`Application ${decision.toLowerCase()}d successfully`);

      // Send notification email to applicant
      const emailResponse = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: applicantId,
          recipientType: "TENANT",
          type: "EMAIL",
          subject: `Application Status Update`,
          message: statusMessage,
        }),
      });

      if (!emailResponse.ok) {
        console.warn("Failed to send notification email:", emailResponse.statusText);
        toast.warning("Application updated but failed to send notification email");
      } else {
        toast.success("Notification email sent to applicant");
      }
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update application status");
    }
  };

  // Get risk level color
  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  // Get risk level badge variant
  const getRiskBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    if (score >= 40) return "outline";
    return "destructive";
  };

  // Get recommendation badge variant
  const getRecommendationVariant = (recommendation: string) => {
    switch (recommendation) {
      case "APPROVE":
        return "default";
      case "REVIEW":
        return "secondary";
      case "DENY":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/5"></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <Alert>
        <AlertDescription>
          Applicant not found. Please ensure the applicant ID is correct.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tenant Screening</h2>
          <p className="text-muted-foreground">
            AI-powered analysis for {applicant.firstName} {applicant.lastName}
          </p>
        </div>
        <Button
          onClick={runScreeningAnalysis}
          disabled={isAnalyzing}
          className="gap-2"
        >
          <Brain className="h-4 w-4" />
          {isAnalyzing ? "Analyzing..." : "Re-run AI Analysis"}
        </Button>
      </div>

      {/* Applicant Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applicant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Applicant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="font-medium">{applicant.firstName} {applicant.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="font-medium">{applicant.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="font-medium">{applicant.phone || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Employment</label>
                <p className="font-medium">{applicant.employmentStatus}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Monthly Income</label>
                <p className="font-medium">${applicant.monthlyIncome.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Annual Income</label>
                <p className="font-medium">${applicant.annualIncome.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Credit Score</label>
                <p className="font-medium">{applicant.creditScore || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Employment Years</label>
                <p className="font-medium">{applicant.employmentYears} years</p>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">Previous Address</label>
              <p className="font-medium">{applicant.previousAddress}</p>
            </div>

            {applicant.rentalHistory && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rental History</label>
                <p className="font-medium">{applicant.rentalHistory}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Screening Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Screening Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {screeningResult ? (
              <div className="space-y-6">
                {/* Risk Score */}
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getRiskColor(screeningResult.riskScore)}`}>
                    {screeningResult.riskScore}%
                  </div>
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <Progress value={screeningResult.riskScore} className="mt-2" />
                </div>

                {/* Recommendation */}
                <div className="flex justify-center">
                  <Badge
                    variant={getRecommendationVariant(screeningResult.recommendation)}
                    className="text-lg px-4 py-2"
                  >
                    {screeningResult.recommendation === "APPROVE" && <CheckCircle className="h-4 w-4 mr-2" />}
                    {screeningResult.recommendation === "DENY" && <XCircle className="h-4 w-4 mr-2" />}
                    {screeningResult.recommendation === "REVIEW" && <AlertTriangle className="h-4 w-4 mr-2" />}
                    {screeningResult.recommendation}
                  </Badge>
                </div>

                {/* Confidence */}
                <div className="text-center">
                  <div className="text-lg font-medium">
                    {Math.round(screeningResult.confidence)}% Confidence
                  </div>
                  <p className="text-sm text-muted-foreground">Analysis confidence</p>
                </div>

                {/* Reasoning */}
                <div>
                  <h4 className="font-medium mb-2">AI Reasoning</h4>
                  <ul className="space-y-1">
                    {screeningResult.reasoning.map((reason, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Red Flags */}
                {screeningResult.redFlags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-destructive">Red Flags</h4>
                    <ul className="space-y-1">
                      {screeningResult.redFlags.map((flag, index) => (
                        <li key={index} className="text-sm text-destructive flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {screeningResult.recommendation !== "DENY" && (
                    <Button
                      onClick={() => handleApproval("APPROVE")}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Application
                    </Button>
                  )}
                  {screeningResult.recommendation !== "APPROVE" && (
                    <Button
                      variant="destructive"
                      onClick={() => handleApproval("DENY")}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Deny Application
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Re-run AI Analysis" to generate screening results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      {screeningResult && (
        <Card>
          <CardHeader>
            <div className="flex space-x-1">
              {[
                { id: "overview" as TabType, label: "Overview", icon: Home },
                { id: "details" as TabType, label: "Details", icon: FileText },
                { id: "history" as TabType, label: "History", icon: Clock },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-2xl font-bold">{applicant.creditScore || "N/A"}</div>
                    <p className="text-sm text-muted-foreground">Credit Score</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{Math.round((applicant.monthlyIncome / applicant.requestedRent) * 100)}%</div>
                    <p className="text-sm text-muted-foreground">Income Ratio</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{applicant.criminalHistory ? "Yes" : "No"}</div>
                    <p className="text-sm text-muted-foreground">Criminal Record</p>
                  </div>
                  <div className="text-center">
                    <Home className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{applicant.evictionHistory ? "Yes" : "No"}</div>
                    <p className="text-sm text-muted-foreground">Eviction History</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Employment Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2 font-medium">{applicant.employmentStatus}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Years:</span>
                      <span className="ml-2 font-medium">{applicant.employmentYears} years</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Financial Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Monthly Income:</span>
                      <span className="ml-2 font-medium">${applicant.monthlyIncome.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Requested Rent:</span>
                      <span className="ml-2 font-medium">${applicant.requestedRent.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Income-to-Rent Ratio:</span>
                      <span className="ml-2 font-medium">
                        {Math.round((applicant.monthlyIncome / applicant.requestedRent) * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Annual Income:</span>
                      <span className="ml-2 font-medium">${applicant.annualIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {applicant.references && applicant.references.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">References</h4>
                    <ul className="space-y-1">
                      {applicant.references.map((reference, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {reference}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                {screeningHistory.length > 0 ? (
                  <div className="space-y-3">
                    {screeningHistory.map((history) => (
                      <div key={history.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            history.riskScore >= 80 ? "bg-green-500" :
                            history.riskScore >= 60 ? "bg-yellow-500" :
                            history.riskScore >= 40 ? "bg-orange-500" : "bg-red-500"
                          }`} />
                          <div>
                            <p className="font-medium">{history.recommendation}</p>
                            <p className="text-sm text-muted-foreground">
                              Risk Score: {history.riskScore}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(history.processedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(history.processedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No screening history available</p>
                    <p className="text-sm">Previous analyses and decisions for this applicant</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { TenantScreening };
