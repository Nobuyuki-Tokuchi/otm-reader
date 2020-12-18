
export interface ActionResult {
    result: "done" | "fail" | "none";
    reason?: unknown;
}
