import PDFKit
import AppKit
let args = CommandLine.arguments
let url = URL(fileURLWithPath: args[1]); let out = args[2]; let scale: CGFloat = 1.6
guard let doc = PDFDocument(url: url) else { print("cannot open \(args[1])"); exit(1) }
for i in 0..<doc.pageCount {
  guard let page = doc.page(at: i) else { continue }
  let b = page.bounds(for: .mediaBox); let w = Int(b.width * scale), h = Int(b.height * scale)
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState(); let ctx = NSGraphicsContext(bitmapImageRep: rep)!; NSGraphicsContext.current = ctx
  ctx.cgContext.setFillColor(NSColor.white.cgColor); ctx.cgContext.fill(CGRect(x: 0, y: 0, width: w, height: h))
  ctx.cgContext.scaleBy(x: scale, y: scale); page.draw(with: .mediaBox, to: ctx.cgContext); NSGraphicsContext.restoreGraphicsState()
  let png = rep.representation(using: .png, properties: [:])!; try! png.write(to: URL(fileURLWithPath: String(format: "%@-p%02d.png", out, i + 1)))
  if let t = page.string { try? t.write(toFile: String(format: "%@-p%02d.txt", out, i + 1), atomically: true, encoding: .utf8) }
}
print("\(args[1]): \(doc.pageCount) pages")
