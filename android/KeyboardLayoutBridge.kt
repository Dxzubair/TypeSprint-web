package com.typesprint.app.keyboard

import android.content.Context
import android.hardware.input.InputManager
import android.os.Build
import android.view.InputDevice
import android.view.KeyEvent
import android.view.inputmethod.InputMethodManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject
import java.util.*

/**
 * KeyboardLayoutBridge handles automatic physical keyboard layout detection in Android.
 * It provides:
 * 1. Physical input device scanning (API 29+ InputDevice query).
 * 2. Active IME layout sub-type checking.
 * 3. Input event layout heuristics (real-time keypress inference).
 * 4. Safe bridge to Web Front-End (Vite/React) via `@JavascriptInterface`.
 */
class KeyboardLayoutBridge(
    private val context: Context,
    private val webView: WebView
) {

    private val inputManager: InputManager by lazy {
        context.getSystemService(Context.INPUT_SERVICE) as InputManager
    }

    /**
     * Interface exposed to JavaScript inside TypeSprint's WebView.
     */
    @JavascriptInterface
    fun checkHardwareKeyboardLayout(): String {
        val result = JSONObject()
        try {
            val detectedLayout = scanHardwareLayouts()
            val deviceName = getConnectedKeyboardName()
            val isPhysicalConnected = isPhysicalKeyboardConnected()

            result.put("status", "success")
            result.put("isPhysicalConnected", isPhysicalConnected)
            result.put("deviceName", deviceName)
            result.put("layout", detectedLayout) // QWERTY, AZERTY, QWERTZ, DVORAK, COLEMAK
            result.put("apiLevel", Build.VERSION.SDK_INT)
        } catch (e: Exception) {
            result.put("status", "error")
            result.put("message", e.localizedMessage)
        }
        return result.toString()
    }

    /**
     * Detects if any external hardware physical keyboard is currently connected.
     */
    fun isPhysicalKeyboardConnected(): Boolean {
        val deviceIds = inputManager.inputDeviceIds
        for (id in deviceIds) {
            val device = inputManager.getInputDevice(id) ?: continue
            val sources = device.sources
            
            // Check if device is a physical, non-virtual keyboard with alphabetical keys
            if ((sources and InputDevice.SOURCE_KEYBOARD) == InputDevice.SOURCE_KEYBOARD &&
                device.keyboardType == InputDevice.KEYBOARD_TYPE_ALPHABETIC &&
                !device.isVirtual
            ) {
                return true
            }
        }
        return false
    }

    /**
     * Gets the product name of the primary connected physical keyboard.
     */
    fun getConnectedKeyboardName(): String {
        val deviceIds = inputManager.inputDeviceIds
        for (id in deviceIds) {
            val device = inputManager.getInputDevice(id) ?: continue
            if ((device.sources and InputDevice.SOURCE_KEYBOARD) == InputDevice.SOURCE_KEYBOARD &&
                device.keyboardType == InputDevice.KEYBOARD_TYPE_ALPHABETIC &&
                !device.isVirtual
            ) {
                return device.name ?: "External Keyboard"
            }
        }
        return "No Physical Keyboard Connected"
    }

    /**
     * Scans Android system configuration and IME sub-types to determine layout.
     */
    private fun scanHardwareLayouts(): String {
        // Step 1: Query connected physical keyboard layouts (Android Pie / API 28+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val deviceIds = inputManager.inputDeviceIds
            for (id in deviceIds) {
                val device = inputManager.getInputDevice(id) ?: continue
                if ((device.sources and InputDevice.SOURCE_KEYBOARD) == InputDevice.SOURCE_KEYBOARD &&
                    device.keyboardType == InputDevice.KEYBOARD_TYPE_ALPHABETIC &&
                    !device.isVirtual
                ) {
                    // Modern Android API enables querying active layouts directly
                    // Note: In custom ROMs, we query product IDs and match known profiles
                    val descriptor = device.descriptor ?: ""
                    if (descriptor.contains("azerty", ignoreCase = true)) return "AZERTY"
                    if (descriptor.contains("qwertz", ignoreCase = true)) return "QWERTZ"
                    if (descriptor.contains("dvorak", ignoreCase = true)) return "DVORAK"
                    if (descriptor.contains("colemak", ignoreCase = true)) return "COLEMAK"
                }
            }
        }

        // Step 2: Query active InputMethodManager (IME) layouts & system locales
        try {
            val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            val ims = imm.currentInputMethodSubtype
            if (ims != null) {
                val mode = ims.mode
                val locale = ims.languageTag
                val extraValue = ims.extraValue ?: ""

                if (extraValue.contains("KeyboardLayout=azerty", ignoreCase = true) || 
                    locale.contains("fr", ignoreCase = true) || 
                    locale.contains("be", ignoreCase = true)
                ) {
                    return "AZERTY"
                }
                if (extraValue.contains("KeyboardLayout=qwertz", ignoreCase = true) || 
                    locale.contains("de", ignoreCase = true) || 
                    locale.contains("ch", ignoreCase = true) || 
                    locale.contains("at", ignoreCase = true)
                ) {
                    return "QWERTZ"
                }
                if (extraValue.contains("KeyboardLayout=dvorak", ignoreCase = true)) {
                    return "DVORAK"
                }
                if (extraValue.contains("KeyboardLayout=colemak", ignoreCase = true)) {
                    return "COLEMAK"
                }
            }
        } catch (e: Exception) {
            // Fallback to active system language
        }

        // Default fallback: Check default locale
        val locale = Locale.getDefault().language
        if (locale == "fr") return "AZERTY"
        if (locale == "de") return "QWERTZ"

        return "QWERTY"
    }

    /**
     * Optional: Heuristic Input Inference Engine.
     * Captures physical keyboard events and infers layout by matching key codes vs characters.
     * This is useful when the physical keyboard's firmware layout differs from the OS language setting.
     */
    class KeyHeuristicDetector {
        private var qPresses = 0
        private var aPresses = 0
        private var zPresses = 0
        private var yPresses = 0

        /**
         * Analyzes a Key Down Event to infer the active keyboard layout.
         * For instance, if keycode Q is pressed:
         * - If it produces character 'a', we infer AZERTY.
         * - If it produces character 'q', we infer QWERTY/QWERTZ.
         */
        fun recordKeyPress(keyCode: Int, unicodeChar: Int): String? {
            val char = unicodeChar.toChar()
            
            // KEYCODE_Q represents physical key 'Q' on top-left of standard ANSI keyboards
            if (keyCode == KeyEvent.KEYCODE_Q) {
                if (char == 'a' || char == 'A') {
                    aPresses++
                    if (aPresses >= 2) return "AZERTY"
                } else if (char == 'q' || char == 'Q') {
                    qPresses++
                    if (qPresses >= 2) return "QWERTY"
                }
            }
            
            // KEYCODE_Y and KEYCODE_Z are swapped between QWERTY and QWERTZ layouts
            if (keyCode == KeyEvent.KEYCODE_Y && (char == 'z' || char == 'Z')) {
                zPresses++
                if (zPresses >= 2) return "QWERTZ"
            }
            if (keyCode == KeyEvent.KEYCODE_Z && (char == 'y' || char == 'Y')) {
                yPresses++
                if (yPresses >= 2) return "QWERTZ"
            }

            return null // Insufficient data
        }
    }

    /**
     * Push layout state dynamically from Kotlin to React JS context
     */
    fun dispatchLayoutChangeToWeb(layout: String) {
        webView.post {
            webView.evaluateJavascript(
                "javascript:if(window.onAndroidKeyboardLayoutChanged) { window.onAndroidKeyboardLayoutChanged('$layout'); }",
                null
            )
        }
    }
}
