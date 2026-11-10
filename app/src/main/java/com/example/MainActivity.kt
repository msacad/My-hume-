package com.example

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import java.io.InputStream

class MainActivity : ComponentActivity() {

  private lateinit var webView: WebView

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Keep screen on during driving simulation
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

    // Immersive Fullscreen sticky landscape
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.hide(WindowInsetsCompat.Type.systemBars())
    controller.systemBarsBehavior =
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

    // Create high-performance hardware accelerated WebView
    webView = WebView(this).apply {
      setLayerType(View.LAYER_TYPE_HARDWARE, null)
      setBackgroundColor(0xFF0A0E14.toInt())

      settings.apply {
        javaScriptEnabled = true
        domStorageEnabled = true
        allowFileAccess = true
        allowContentAccess = true
        allowFileAccessFromFileURLs = true
        allowUniversalAccessFromFileURLs = true
        mediaPlaybackRequiresUserGesture = false
        useWideViewPort = true
        loadWithOverviewMode = true
        databaseEnabled = true
        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        cacheMode = WebSettings.LOAD_DEFAULT
      }

      webChromeClient = object : WebChromeClient() {
        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
          consoleMessage?.let {
            Log.d("SomalilandGame", "${it.message()} [${it.sourceId()}:${it.lineNumber()}]")
          }
          return true
        }
      }

      webViewClient = object : WebViewClient() {
        override fun shouldInterceptRequest(
            view: WebView?,
            request: WebResourceRequest?
        ): WebResourceResponse? {
          val uri = request?.url ?: return null
          val host = uri.host
          if (host == "somaliland.game" || host == "localhost" || uri.scheme == "file") {
            var path = uri.path ?: ""
            if (path.isEmpty() || path == "/") {
              path = "/index.html"
            }
            if (path.startsWith("/")) {
              path = path.substring(1)
            }
            val assetPath = "www/$path"
            try {
              val stream: InputStream = assets.open(assetPath)
              val mimeType = getMimeType(assetPath)
              val headers = mutableMapOf(
                  "Access-Control-Allow-Origin" to "*",
                  "Access-Control-Allow-Methods" to "GET, OPTIONS",
                  "Access-Control-Allow-Headers" to "*"
              )
              return WebResourceResponse(mimeType, "UTF-8", 200, "OK", headers, stream)
            } catch (e: Exception) {
              Log.w("SomalilandGame", "Could not load asset: $assetPath - ${e.message}")
            }
          }
          return super.shouldInterceptRequest(view, request)
        }

        override fun onReceivedError(
            view: WebView?,
            errorCode: Int,
            description: String?,
            failingUrl: String?
        ) {
          super.onReceivedError(view, errorCode, description, failingUrl)
          Log.e("SomalilandGame", "Error loading $failingUrl: $description (code $errorCode)")
        }

        override fun onPageFinished(view: WebView?, url: String?) {
          super.onPageFinished(view, url)
          Log.i("SomalilandGame", "Page loaded successfully: $url")
        }
      }

      // Load via custom secure origin intercepted locally from assets
      loadUrl("https://somaliland.game/index.html")
    }

    setContentView(webView)

    // Handle back button
    onBackPressedDispatcher.addCallback(
        this,
        object : OnBackPressedCallback(true) {
          override fun handleOnBackPressed() {
            webView.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('androidBackPressed'));",
                null
            )
          }
        }
    )
  }

  private fun getMimeType(path: String): String {
    return when {
      path.endsWith(".html") -> "text/html"
      path.endsWith(".js") || path.endsWith(".mjs") -> "text/javascript"
      path.endsWith(".css") -> "text/css"
      path.endsWith(".png") -> "image/png"
      path.endsWith(".jpg") || path.endsWith(".jpeg") -> "image/jpeg"
      path.endsWith(".json") -> "application/json"
      path.endsWith(".svg") -> "image/svg+xml"
      path.endsWith(".webp") -> "image/webp"
      path.endsWith(".ttf") || path.endsWith(".otf") -> "font/ttf"
      path.endsWith(".woff") -> "font/woff"
      path.endsWith(".woff2") -> "font/woff2"
      else -> "application/octet-stream"
    }
  }

  override fun onResume() {
    super.onResume()
    webView.onResume()
  }

  override fun onPause() {
    super.onPause()
    webView.onPause()
  }

  override fun onDestroy() {
    webView.destroy()
    super.onDestroy()
  }
}
