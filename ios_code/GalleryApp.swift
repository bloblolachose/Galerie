import SwiftUI
import WebKit

// 1. Main App Structure
@main
struct GalleryApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .edgesIgnoringSafeArea(.all) // Immersive full screen
                .statusBar(hidden: true)     // Hide status bar
                .persistentSystemOverlays(.hidden) // Hide home indicator if possible
        }
    }
}

// 2. The WebView Component
struct GalleryWebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let prefs = WKWebpagePreferences()
        prefs.allowsContentJavaScript = true
        
        let config = WKWebViewConfiguration()
        config.defaultWebpagePreferences = prefs
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.scrollView.bounces = false // Disable rubber-banding
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        uiView.load(request)
    }
}

// 3. Main View
struct ContentView: View {
    // REPLACE THIS WITH YOUR COMPUTER'S IP
    // Ensure both devices are on the same WiFi
    let serverURL = "http://172.20.10.197:3000" 

    var body: some View {
        if let url = URL(string: serverURL) {
            GalleryWebView(url: url)
                .background(Color.black)
        } else {
            Text("Invalid URL")
                .foregroundColor(.white)
                .background(Color.black)
        }
    }
}

/* 
 IMPORTANT - BEFORE RUNNING IN XCODE:
 
 1. Go to your "Info.plist"
 2. Add Key: "App Transport Security Settings"
 3. Inside it, set "Allow Arbitrary Loads" to YES.
    (This is required to allow HTTP connections to your local computer)
*/
