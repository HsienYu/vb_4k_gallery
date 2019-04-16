ARMBIAN UNOFFICIAL RK3288 MEDIA TESTING SCRIPT
----------------------------------------------
v2.0 Bionic - 2018/10/22


This script will install several multimedia-related software pieces in a
RK3288 Ubuntu Bionic Armbian desktop default image (kernel 4.4.y).
Currently it only supports the installation of the features, while
uninstall must be performed manually.

The script must be run in a command line from the same directory it was
unpacked (./media-rk3288.sh), and will ask for superuser privileges if
not launched with "sudo". Each subfolder contains, in addition to the
packages needed for installation, a text file with information about the
sources for those packages.

The script will present the user with a menu where they can select the
features to be installed. Here is a brief description of each option:

- System: This option will install the base libraries, X server packages
          and system files configuration. It must be run at least once
          before installing any of the other features, or after any
          system upgrade that modified X or Chromium configuration.
          Enabling system config will also present the user with the
          choice of two different versions of the Rockchip X server:
            · Stable: The standard version that you can download from 
              Rockchip repos.
            . Experimental: This version is taken from some PR that 
              didn't make it into the release version, and is supposed
              to give better performance. More info here:
              https://github.com/rockchip-linux/xserver/pull/10
           
- Devel: When this option is enabled, the script will install the 
         development libraries for every other option that is selected.
         So, for example, if in your first run of the script you keep 
         this option disabled and enable the rest, it will install all 
         the features but without any devel lib. If eventually you need,
         e.g., to compile some app requiring Gstreamer development libs,
         then you can run again the script, and select only "Devel" and
         "Gstreamer", so in that run it will only install Gstreamer with
         the development libraries, without touching the rest.
         
- MPV: This is a RKMPP accelerated version of MPV. In order to use the 
       hardware acceleration, it needs to make use of KMS for display,
       which means that it will ignore the X server if it is running,
       and play video in a full-screen overlay, using keyboard or LIRC
       to control the player. Type "man mpv" for a list of keyboard
       controls (tip: shift+Q will save position and exit).
       Alternatively, you can also use software decoding, and output to
       a X window with mouse support. It will still have some display
       acceleration through X11/EGL, though not as efficient as GBM/KMS.
         · To use the X, non-RKMPP version, just type "mpv <file>" in
           the console, or use the launcher labeled simply "MPV".
         . To use the GBM+RKMPP version, type "mpv-gbm <file>", or use
           the "MPV (GBM)" launcher.
         · You can use the player even in a console-only session.

- Gstreamer: These are the Rockchip Gstreamer plugins for media playback
             and capture.
             Notice that the Gstreamer plugin is the only method that
             allows full RKMMP+KMS acceleration associated to a X 
             window.
               · To play a video in a X session, use the launcher "Rock-
                 chip Gst Player".
               . From the command line, in a X session, type:
                 "gst-play-1.0 --videosink=rkximagesink <file>"
               . From a console-only session, type:
                 "gst-play-1.0 --videosink=kmssink <file>"

- CLSamples: A couple of simple programs to test OpenCL capabilities:
	     · Compiled examples from the Arm Compute Library
	     . An old GPU crypto miner (cgminer) with support for
	       extra algorythms like Skein.
	     They are installed under ~/clsamples, where you can find
	     a readme.txt file with instructions.

- GL4ES: An Opengl-ES wrapper library that will allow you to use OpenGL
         1.5-2.0 compatible programs with hardware acceleration. 
         More info: https://github.com/ptitSeb/gl4es.
         · In order to make it easier to use the library, we have
           included a script called "glrun", that will set the proper
           environment variables. Launch your OpenGL program like this:
           "glrun <command>"
         
- Streaming: This will install the Widevine and Pepper-Flash libraries
             for Chrome, enabling you to stream videos from sites such
             as Netflix (tested) or Hulu (untested).
             It will also install the h264ify addon, which will force
             all Youtube videos to use the H.264 codec.

- Equalizer: A GTK-based equalizer for PulseAudio, using LADSPA. You
             need to enable it through the menu entry, and select the
             desired preset or tweak your own settings. The "Boosted"
             preset is recommended for everyday use.
             This package is old and unmaintained, but I still find it
             useful.

- Kodi: Kodi 18.0 Leia beta 3. This version is supposed to be stable
        enough for normal use. But the main purpose of including Kodi in
        the script is to test the new RKMPP+KMS implementation. We don't
        intend to offer a full-fledged distribution of Kodi. For that, I
        recommend using LibreELEC.
        It cannot be launched from an active X session, you need to
        switch to a virtual terminal first.
        · The "Kodi" desktop launcher will switch you to VT1, launch
          Kodi and then bring you back to VT7.
        · From the command line, in a X session, type:
          "kodi-gbm-wrapper" for the same effect.
        · If you are already in a console-only session, you can just 
          type "kodi".

All the RKMPP accelerated players can handle up to 4K@30 HEVC with
perfect smoothness.


Please report bugs and suggestions in the thread dedicated to this
script at the Armbian Forum. Enjoy!

JMCC.
