package ph.net.mobile.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Shader
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import androidx.core.content.ContextCompat

object TiledDrawable {
    fun create(context: Context, drawableResId: Int): Drawable? {
        val drawable = ContextCompat.getDrawable(context, drawableResId) ?: return null
        
        // Convert vector/drawable to bitmap
        val bitmap = Bitmap.createBitmap(
            drawable.intrinsicWidth,
            drawable.intrinsicHeight,
            Bitmap.Config.ARGB_8888
        )
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)

        return BitmapDrawable(context.resources, bitmap).apply {
            tileModeX = Shader.TileMode.REPEAT
            tileModeY = Shader.TileMode.REPEAT
            alpha = 51 // ~0.2 alpha (255 * 0.2)
        }
    }
}