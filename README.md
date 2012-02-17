KotNet Indicator
================

Intro
-----
The KotNet Indicator is a small tool that integrates with the desktop environment to ease the connectivity and monitoring of your KU Leuven [KotNet](https://admin.kuleuven.be/icts/services/kotnet) account. To do so, the indicator visualizes the connectivity status via an icon. This status is continuously updated via a Perl script that does the routine which the user usually does via his or her browser. When clicking the intdicator icon, a small dropdown balloon appears, showing information about the current status. This can either be a visualization of the up- and download quota or a clearifying message indicating why no connection could be made. Upon that, the tool provides a very easy configuration: at the bottom of the dorpdown balloon one can expand the options submenu. This will show two entries: one for the user Id (aka s-number for students) and one for the password.


Screenshots
-----------
![Screenshot 1] (http://dennisdegryse.be/resources/gnome-shell-kotnet.png)

_(more coming soon)_


Requirements
------------
+ The goal is to provide this tool for as many desktop environments as possible. This first version is targetted at [Gnome Shell 3.2](http://live.gnome.org/GnomeShell) and therefore requires this DE;
+ Apart from that the login and quota scraping script is written in [Perl](http://www.perl.org/get.html), thus you will need a Perl setup and at least the [WWW::Mechanize](http://search.cpan.org/dist/WWW-Mechanize/lib/WWW/Mechanize.pm) module (a more complete list of modules will be provided).


Installation
------------
The package contains a Makefile, so installing is as easy as running the following (note that the --DE parameter is optional as long as only gnome-shell is supported):

    $ make --DE=gnome-shell
    $ make install

Support & Contribute
--------------------
I like to receive feedback concerning bug reports and feature requests. Please feel free to use the GitHub Issues system for this. If you would like to contribute in any way, then you can mail me [dennisdegryse __[at]__ gmail __[dot]__ com](mailto:dennisdegryse@gmail.com)
