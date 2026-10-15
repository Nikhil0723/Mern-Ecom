
import React, { useMemo, useState, useSyncExternalStore } from "react";
import {
    clearRequests,
    getRequestsSnapshot,
    subscribeToRequests,
} from "@/lib/apiInspector";

const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

const formatDuration = (duration) =>
    duration == null ? "Pending…" : `${duration} ms`;

const statusColor = (request) => {
    if (request.status === "Pending") {
        return "bg-blue-50 text-blue-700";
    }

    if (request.status === "Success") {
        return "bg-emerald-50 text-emerald-700";
    }

    return "bg-red-50 text-red-700";
};

const JsonViewer = ({ value }) => (
    <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-emerald-300">
        {JSON.stringify(value ?? null, null, 2)}
    </pre>
);

const ApiInspector = () => {
    const requests = useSyncExternalStore(
        subscribeToRequests,
        getRequestsSnapshot,
        getRequestsSnapshot
    );

    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [detailTab, setDetailTab] = useState("overview");

    const filteredRequests = useMemo(() => {
        return requests.filter((request) => {
            const matchesSearch =
                `${request.method} ${request.url} ${request.error || ""}`
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesMethod =
                methodFilter === "ALL" || request.method === methodFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "SUCCESS" && request.status === "Success") ||
                (statusFilter === "ERROR" && request.status !== "Success" &&
                    request.status !== "Pending");

            return matchesSearch && matchesMethod && matchesStatus;
        });
    }, [requests, search, methodFilter, statusFilter]);

    const selectedRequest =
        requests.find((request) => request.id === selectedId) ||
        filteredRequests[0] ||
        requests[0];

    const summary = useMemo(() => {
        const completed = requests.filter((request) => request.duration != null);
        const successful = requests.filter(
            (request) => request.status === "Success"
        );
        const failed = requests.filter(
            (request) => request.status === "Error" ||
                request.status === "Network Error"
        );

        return {
            total: requests.length,
            successful: successful.length,
            failed: failed.length,
            average: completed.length
                ? Math.round(
                    completed.reduce((sum, request) => sum + request.duration, 0) /
                    completed.length
                )
                : 0,
        };
    }, [requests]);

    if (!import.meta.env.DEV) return null;

    const selectRequest = (request) => {
        setSelectedId(request.id);
        setDetailTab("overview");
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                aria-label="Open API inspector"
            >
                <span className="relative flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                API Inspector
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                    {requests.length}
                </span>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-2 backdrop-blur-[2px] sm:p-5"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setOpen(false);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="api-inspector-title"
                        className="flex h-[min(850px,94dvh)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    >
                        <header className="flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2
                                        id="api-inspector-title"
                                        className="text-lg font-semibold tracking-tight"
                                    >
                                        API Inspector
                                    </h2>
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                        Development
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                    Inspect requests made through your Axios API service.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg px-3 py-2 text-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                aria-label="Close API inspector"
                            >
                                ×
                            </button>
                        </header>

                        <div className="grid grid-cols-2 gap-3 border-b bg-slate-50/70 p-4 sm:grid-cols-4 sm:px-6">
                            {[
                                ["Requests", summary.total],
                                ["Successful", summary.successful],
                                ["Failed", summary.failed],
                                ["Avg. duration", `${summary.average} ms`],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-xl border bg-white p-3"
                                >
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="mt-1 text-xl font-semibold tabular-nums">
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)]">
                            <aside className="flex min-h-0 flex-col border-b lg:border-b-0 lg:border-r">
                                <div className="space-y-3 border-b p-4">
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search endpoints or errors..."
                                        className="h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <div className="flex gap-2">
                                        <select
                                            value={methodFilter}
                                            onChange={(event) => setMethodFilter(event.target.value)}
                                            className="h-9 min-w-0 flex-1 rounded-lg border bg-white px-2 text-sm"
                                        >
                                            <option value="ALL">All methods</option>
                                            {["GET", "POST", "PUT", "PATCH", "DELETE"].map(
                                                (method) => (
                                                    <option key={method} value={method}>
                                                        {method}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <select
                                            value={statusFilter}
                                            onChange={(event) => setStatusFilter(event.target.value)}
                                            className="h-9 min-w-0 flex-1 rounded-lg border bg-white px-2 text-sm"
                                        >
                                            <option value="ALL">All statuses</option>
                                            <option value="SUCCESS">Successful</option>
                                            <option value="ERROR">Errors</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">
                                            {filteredRequests.length} request(s)
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                clearRequests();
                                                setSelectedId(null);
                                            }}
                                            className="text-xs font-medium text-red-600 hover:text-red-700"
                                        >
                                            Clear history
                                        </button>
                                    </div>
                                </div>

                                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                                    {filteredRequests.length === 0 ? (
                                        <div className="flex min-h-40 flex-col items-center justify-center px-4 text-center">
                                            <p className="text-sm font-medium">
                                                No requests found
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Navigate through the app to capture API calls.
                                            </p>
                                        </div>
                                    ) : (
                                        filteredRequests.map((request) => (
                                            <button
                                                type="button"
                                                key={request.id}
                                                onClick={() => selectRequest(request)}
                                                className={`w-full rounded-xl border p-3 text-left transition ${selectedRequest?.id === request.id
                                                        ? "border-blue-300 bg-blue-50/70 ring-1 ring-blue-100"
                                                        : "border-slate-200 hover:bg-slate-50"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">
                                                        {request.method}
                                                    </span>
                                                    <span
                                                        className={`rounded-md px-2 py-1 text-[10px] font-semibold ${statusColor(request)}`}
                                                    >
                                                        {request.statusCode ?? request.status}
                                                    </span>
                                                </div>

                                                <p className="mt-2 truncate font-mono text-xs font-medium text-slate-800">
                                                    {request.url}
                                                </p>

                                                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                                    <span>{formatTime(request.startTime)}</span>
                                                    <span>{formatDuration(request.duration)}</span>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </aside>

                            <main className="flex min-h-0 flex-col overflow-hidden">
                                {!selectedRequest ? (
                                    <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
                                        Select a request to inspect its details.
                                    </div>
                                ) : (
                                    <>
                                        <div className="border-b p-4 sm:p-5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-md bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-bold">
                                                    {selectedRequest.method}
                                                </span>
                                                <span
                                                    className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${statusColor(selectedRequest)}`}
                                                >
                                                    {selectedRequest.statusCode ?? selectedRequest.status}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDuration(selectedRequest.duration)}
                                                </span>
                                            </div>
                                            <p className="mt-3 break-all font-mono text-sm font-medium">
                                                {selectedRequest.url}
                                            </p>
                                            {selectedRequest.error && (
                                                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                    {selectedRequest.error}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-1 border-b px-3 pt-2">
                                            {[
                                                ["overview", "Overview"],
                                                ["request", "Request"],
                                                ["response", "Response"],
                                                ["headers", "Headers"],
                                            ].map(([value, label]) => (
                                                <button
                                                    type="button"
                                                    key={value}
                                                    onClick={() => setDetailTab(value)}
                                                    className={`border-b-2 px-3 py-2.5 text-xs font-medium ${detailTab === value
                                                            ? "border-blue-600 text-blue-700"
                                                            : "border-transparent text-muted-foreground hover:text-slate-900"
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4 sm:p-5">
                                            {detailTab === "overview" && (
                                                <>
                                                    <div className="rounded-xl border p-4">
                                                        <h3 className="mb-3 text-sm font-semibold">
                                                            Request overview
                                                        </h3>
                                                        <dl className="space-y-3 text-sm">
                                                            {[
                                                                ["Method", selectedRequest.method],
                                                                ["Status", selectedRequest.statusCode ?? selectedRequest.status],
                                                                ["Duration", formatDuration(selectedRequest.duration)],
                                                                ["Started", new Date(selectedRequest.startTime).toLocaleString()],
                                                            ].map(([label, value]) => (
                                                                <div
                                                                    key={label}
                                                                    className="flex flex-wrap justify-between gap-3 border-b pb-2 last:border-0 last:pb-0"
                                                                >
                                                                    <dt className="text-muted-foreground">{label}</dt>
                                                                    <dd className="break-all text-right font-medium">
                                                                        {value}
                                                                    </dd>
                                                                </div>
                                                            ))}
                                                        </dl>
                                                    </div>

                                                    <div>
                                                        <h3 className="mb-2 text-sm font-semibold">
                                                            Response body
                                                        </h3>
                                                        <JsonViewer value={selectedRequest.responseData} />
                                                    </div>
                                                </>
                                            )}

                                            {detailTab === "request" && (
                                                <>
                                                    <div>
                                                        <h3 className="mb-2 text-sm font-semibold">
                                                            Query parameters
                                                        </h3>
                                                        <JsonViewer value={selectedRequest.requestData} />
                                                    </div>
                                                    <div>
                                                        <h3 className="mb-2 text-sm font-semibold">
                                                            Request body
                                                        </h3>
                                                        <JsonViewer value={selectedRequest.requestBody} />
                                                    </div>
                                                </>
                                            )}

                                            {detailTab === "response" && (
                                                <div>
                                                    <h3 className="mb-2 text-sm font-semibold">
                                                        Response body
                                                    </h3>
                                                    <JsonViewer value={selectedRequest.responseData} />
                                                </div>
                                            )}

                                            {detailTab === "headers" && (
                                                <>
                                                    <div>
                                                        <h3 className="mb-2 text-sm font-semibold">
                                                            Request headers
                                                        </h3>
                                                        <JsonViewer value={selectedRequest.requestHeaders} />
                                                    </div>
                                                    <div>
                                                        <h3 className="mb-2 text-sm font-semibold">
                                                            Response headers
                                                        </h3>
                                                        <JsonViewer value={selectedRequest.responseHeaders} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </main>
                        </div>

                        <footer className="flex items-center justify-between gap-3 border-t bg-slate-50 px-4 py-3 text-xs text-muted-foreground sm:px-6">
                            <span>In-memory history · Maximum 200 requests</span>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg border bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                            >
                                Close inspector
                            </button>
                        </footer>
                    </section>
                </div>
            )}
        </>
    );
};

export default ApiInspector;
