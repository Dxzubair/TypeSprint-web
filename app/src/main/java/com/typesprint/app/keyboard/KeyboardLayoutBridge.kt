package com.typesprint.app.keyboard

import android.content.Context
import android.util.AttributeSet
import android.view.KeyEvent
import android.widget.FrameLayout

class KeyboardLayoutBridge @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    interface KeyboardListener {
        fun onKeyPressed(keyCode: Int, keyChar: Char?)
        fun onKeyReleased(keyCode: Int)
    }

    private var listener: KeyboardListener? = null

    fun setKeyboardListener(listener: KeyboardListener) {
        this.listener = listener
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        val keyCode = event.keyCode
        val unicode = event.getUnicodeChar(event.metaState)
        val char = if (unicode != 0) unicode.toChar() else null

        if (event.action == KeyEvent.ACTION_DOWN) {
            listener?.onKeyPressed(keyCode, char)
        } else if (event.action == KeyEvent.ACTION_UP) {
            listener?.onKeyReleased(keyCode)
        }
        return super.dispatchKeyEvent(event)
    }
}
