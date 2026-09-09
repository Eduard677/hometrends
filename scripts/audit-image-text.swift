import Foundation
import Vision
import ImageIO

// Read-only OCR of cached originals. Output is a review report, never a retouched image.
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let directory = root.appendingPathComponent(".cache/catalogue-originals")
let files = try FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil).sorted { $0.path < $1.path }
var results: [[String: Any]] = []
for file in files {
  if results.count % 100 == 0 {
    let data = try JSONSerialization.data(withJSONObject: results, options: [.prettyPrinted, .sortedKeys])
    try data.write(to: root.appendingPathComponent("reports/image-text-audit-progress.json"))
  }
  autoreleasepool {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = false
    do {
      try VNImageRequestHandler(url: file).perform([request])
      let lines = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }
      if !lines.isEmpty { results.append(["key": file.lastPathComponent, "text": lines.joined(separator: " | ")]) }
    } catch { results.append(["key": file.lastPathComponent, "error": String(describing: error)]) }
  }
}
let data = try JSONSerialization.data(withJSONObject: results, options: [.prettyPrinted, .sortedKeys])
try data.write(to: root.appendingPathComponent("reports/image-text-audit.json"))
print("OCR inspected \(files.count) original images; \(results.count) contained text or could not be read.")
