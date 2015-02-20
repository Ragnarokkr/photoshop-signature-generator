/*
@@@BUILDINFO@@@ signature.jsx 0.0.1 Fri Feb 20 2015 02:22:04 GMT+0100
 */

/*
<javascriptresource>
    <name>Signature Generator</name>
    <menu>automate</menu>
    <about>Signature generator for Photoshop documents.</about>
    <enableinfo>true</enableinfo>
    <category>copyright</category>
</javascriptresource>
*/

/**!
 * @fileOverview It generates a custom signature which will be placed on
 *  every opened document into the application.
 * @version 0.0.1
 * @author Marco Trulla <dev@marcotrulla.it>
 * @license MIT
 * @copyright (c)2014, MarcoTrulla.it - Licensed under MIT License
 */

////////////////
// Configuration
////////////////

#script "Signature Generator"
#target photoshop

$.localize = true;

var BASEPATH = ( new File( $.fileName ) ).path;
var RSRCPATH = BASEPATH + '/rsrc';

//////////
// Imports
//////////

#includepath './include'
#include '_polyfills.jsxinc'
#include '_i18n.jsxinc'
#include '_utils.jsxinc'
#include '_preferences.jsxinc'
#include '_dialog.class.jsxinc'
#include '_signature.class.jsxinc'


/**
 * It reads the resource license file.
 *
 * @returns {string} the license file's content
 */
function sgReadLicense () {
    var f = new File( RSRCPATH + '/license.rsrc' ),
        text = '';

    try {
        if ( f.open() ) {
            text = f.read();
            f.close();
        }
    } catch ( e ) {
        alert( e + ': ', e.line, localize( i18n.title ), true );
    }

    return text;
}


/**
 * It initializes the window dialog by creating all controls with related
 * bindings and listeners.
 *
 * @param model
 * @param view
 * @param controller
 * @returns {SGDialog|*}
 */
function sgInitDialog ( model, view, controller ) {
    view.dialog = new SGDialog();

    view.dialog.onInit = function ( dialog ) {
        // Configure base dialog

        dialog.text = i18n.title;
        dialog.orientation = 'column';


        // Configure base signature data

        view.signature = dialog.grpSignature = dialog.add( 'group' );
        view.signature.orientation = 'row';
        view.signature.alignChildren = [ 'fill', 'fill' ];

        view.signature.st = view.signature.add(
            'statictext', undefined, i18n.textData.signature );

        view.signature.et = view.signature.add(
            'edittext', undefined, model.signature
        );
        view.signature.et.characters = 80;
        view.signature.et.justify = 'center';


        // Configure base tabbed panel

        var tpanel = dialog.tPanel = dialog.add( 'tabbedpanel' );


        // Configure base font data panel

        var tabfont = tpanel.tabFont = tpanel.add( 'tab' );
        tabfont.text = i18n.tabFont.title;
        tabfont.orientation = 'row';
        tabfont.spacing = 10;
        tabfont.alignChildren = [ 'fill', 'top' ];


        // Configure font family data

        var tf_p1 = tabfont.panel1 = tabfont.add( 'panel' );
        tf_p1.text = i18n.tabFont.fontData.title;
        tf_p1.orientation = 'row';

        view.family = tf_p1.grpFamily = tf_p1.add( 'group' );
        view.family.alignChildren = [ 'left', 'center' ];
        view.family.ddl = view.family.add( 'dropdownlist' );
        [].slice.call( app.fonts, 0 ).forEach( function ( font ) {
            view.family.ddl.add( 'item', font.postScriptName );
        } );
        view.family.ddl.selection = 0;

        view.size = tf_p1.grpSize = tf_p1.add( 'group' );
        view.size.alignChildren = [ 'left', 'center' ];
        view.size.et = view.size.add( 'edittext', undefined, model.size );
        view.size.et.characters = 4;
        view.size.et.justify = 'right';
        view.size.pt = view.size.add( 'statictext', undefined, 'pt' );
        view.size.pt.spacing = 0;


        // Configure font aspect data

        var tf_p2 = tabfont.panel2 = tabfont.add( 'panel' );
        tf_p2.text = i18n.tabFont.fontAspect.title;
        tf_p2.orientation = 'column';
        tf_p2.alignChildren = [ 'center', 'top' ];

        view.red = tf_p2.grpRed = tf_p2.add( 'group' );
        view.red.orientation = 'row';
        view.red.alignChildren = [ 'right', 'bottom' ];
        view.red.st = view.red.add( 'statictext', undefined, 'R:' );
        view.red.sl = view.red.add( 'slider' );
        view.red.sl.value = model.color.r;
        view.red.sl.minvalue = 0;
        view.red.sl.maxvalue = 255;
        view.red.et = view.red.add( 'edittext', undefined, model.color.r );
        view.red.et.characters = 4;
        view.red.et.justify = 'right';

        view.green = tf_p2.grpGreen = tf_p2.add( 'group' );
        view.green.orientation = 'row';
        view.green.alignChildren = [ 'right', 'bottom' ];
        view.green.st = view.green.add( 'statictext', undefined, 'G:' );
        view.green.sl = view.green.add( 'slider' );
        view.green.sl.value = model.color.g;
        view.green.sl.minvalue = 0;
        view.green.sl.maxvalue = 255;
        view.green.et = view.green.add( 'edittext', undefined, model.color.g );
        view.green.et.characters = 4;
        view.green.et.justify = 'right';

        view.blue = tf_p2.grpBlue = tf_p2.add( 'group' );
        view.blue.orientation = 'row';
        view.blue.alignChildren = [ 'right', 'bottom' ];
        view.blue.st = view.blue.add( 'statictext', undefined, 'B:' );
        view.blue.sl = view.blue.add( 'slider' );
        view.blue.sl.value = model.color.b;
        view.blue.sl.minvalue = 0;
        view.blue.sl.maxvalue = 255;
        view.blue.et = view.blue.add( 'edittext', undefined, model.color.b );
        view.blue.et.characters = 4;
        view.blue.et.justify = 'right';

        view.opacity = tf_p2.grpOpacity = tf_p2.add( 'group' );
        view.opacity.orientation = 'row';
        view.opacity.alignChildren = [ 'right', 'bottom' ];
        view.opacity.st = view.opacity.add( 'statictext', undefined, i18n.tabFont.fontAspect.opacity );
        view.opacity.sl = view.opacity.add( 'slider' );
        view.opacity.sl.value = model.color.opacity;
        view.opacity.sl.minvalue = 0;
        view.opacity.sl.maxvalue = 100;
        view.opacity.et = view.opacity.add( 'edittext', undefined, model.color.opacity );
        view.opacity.et.characters = 4;
        view.opacity.et.justify = 'right';
        view.opacity.prc = view.opacity.add( 'statictext', undefined, '%' );

        view.colorPicker = tf_p2.btnColorPicker = tf_p2.add( 'button', undefined, i18n.tabFont.fontAspect.colorPicker );


        // Configure base alignment tab data panel

        var tabalignment = tpanel.tabAlignment = tpanel.add( 'tab' );
        tabalignment.text = i18n.tabAlignment.title;
        tabalignment.orientation = 'column';
        tabalignment.spacing = 10;
        tabalignment.alignChildren = [ 'fill', 'top' ];


        // Configure alignment selection data

        view.toggle = tabalignment.toggle = tabalignment.add( 'group' );
        view.toggle.orientation = 'row';
        view.toggle.alignChildren = [ 'center', 'center' ];
        view.toggle.st = view.toggle.add( 'statictext', undefined, i18n.tabAlignment.toggle.title );
        view.toggle.ddl = view.toggle.add( 'dropdownlist' );
        [ i18n.tabAlignment.toggle.relative, i18n.tabAlignment.toggle.absolute ].forEach( function ( item ) {
            view.toggle.ddl.add( 'item', item );
        } );
        view.toggle.ddl.selection = model.alignment;
        view.toggle.ddl.helpTip = i18n.tabAlignment.toggle.helpTip;


        // Configure alignment data

        var ta_g1 = tabalignment.group1 = tabalignment.add( 'group' );
        ta_g1.orientation = 'row';
        ta_g1.alignChildren = [ 'fill', 'top' ];
        ta_g1.spacing = 10;


        // Configure relative alignment data

        var ta_g1_p1 = ta_g1.panel1 = ta_g1.add( 'panel' );
        ta_g1_p1.text = i18n.tabAlignment.relative.title;
        ta_g1_p1.orientation = 'row';
        ta_g1_p1.alignChildren = [ 'fill', 'top' ];
        ta_g1_p1.spacing = 10;

        var ta_g1_p1_g1 = ta_g1_p1.group1 = ta_g1_p1.add( 'group' );
        ta_g1_p1_g1.orientation = 'column';
        ta_g1_p1_g1.alignChildren = [ 'fill', 'top' ];
        view.topLeft = ta_g1_p1_g1.topLeft = ta_g1_p1_g1.add(
            'radiobutton', undefined, i18n.tabAlignment.relative.position.topLeft );
        view.topLeft.label = 'tl';
        view.topLeft.value = model.position.tl;
        view.topRight = ta_g1_p1_g1.topRight = ta_g1_p1_g1.add(
            'radiobutton', undefined, i18n.tabAlignment.relative.position.topRight );
        view.topRight.label = 'tr';
        view.topRight.value = model.position.tr;
        view.middle = ta_g1_p1_g1.middle = ta_g1_p1_g1.add(
            'radiobutton', undefined, i18n.tabAlignment.relative.position.middle );
        view.middle.label = 'mid';
        view.middle.value = model.position.mid;
        view.bottomLeft = ta_g1_p1_g1.bottomLeft = ta_g1_p1_g1.add(
            'radiobutton', undefined, i18n.tabAlignment.relative.position.bottomLeft );
        view.bottomLeft.label = 'bl';
        view.bottomLeft.value = model.position.bl;
        view.bottomRight = ta_g1_p1_g1.bottomRight = ta_g1_p1_g1.add(
            'radiobutton', undefined, i18n.tabAlignment.relative.position.bottomRight );
        view.bottomRight.label = 'br';
        view.bottomRight.value = model.position.br;

        var ta_g1_p1_g2 = ta_g1_p1.group2 = ta_g1_p1.add( 'group' );
        ta_g1_p1_g2.orientation = 'column';
        ta_g1_p1_g2.alignChildren = [ 'fill', 'center' ];

        view.offsetX = view.offsetX = ta_g1_p1_g2.add( 'group' );
        view.offsetX.alignChildren = [ 'right', 'center' ];
        view.offsetX.st = view.offsetX.add( 'statictext', undefined, String.fromCharCode( 0x2194 ) );
        view.offsetX.et = view.offsetX.add( 'edittext', undefined, model.position.offsetX );
        view.offsetX.et.characters = 5;
        view.offsetX.et.justify = 'right';
        view.offsetX.et.helpTip = i18n.tabAlignment.relative.position.helpTipOffsetX;
        view.offsetX.px = view.offsetX.add( 'statictext', undefined, 'px' );


        view.offsetY = view.offsetY = ta_g1_p1_g2.add( 'group' );
        view.offsetY.alignChildren = [ 'right', 'center' ];
        view.offsetY.st = view.offsetY.add( 'statictext', undefined, String.fromCharCode( 0x2195 ) );
        view.offsetY.et = view.offsetY.add( 'edittext', undefined, model.position.offsetY );
        view.offsetY.et.characters = 5;
        view.offsetY.et.justify = 'right';
        view.offsetY.et.helpTip = i18n.tabAlignment.relative.position.helpTipOffsetY;
        view.offsetY.px = view.offsetY.add( 'statictext', undefined, 'px' );


        // Configure absolute alignment data

        var ta_g1_p2 = ta_g1.panel2 = ta_g1.add( 'panel' );
        ta_g1_p2.text = i18n.tabAlignment.absolute.title;
        ta_g1_p2.orientation = 'column';
        ta_g1_p2.alignChildren = [ 'fill', 'top' ];
        ta_g1_p2.enabled = false;

        view.top = ta_g1_p2.absTop = ta_g1_p2.add( 'group' );
        view.top.orientation = 'row';
        view.top.alignChildren = [ 'right', 'center' ];
        view.top.st = view.top.add( 'statictext', undefined, String.fromCharCode( 0x2193 ) );
        view.top.et = view.top.add( 'edittext', undefined, model.position.top );
        view.top.et.characters = 5;
        view.top.et.justify = 'right';
        view.top.et.helpTip = i18n.tabAlignment.absolute.helpTipTop;
        view.top.px = view.top.add( 'statictext', undefined, 'px' );

        view.left = ta_g1_p2.absLeft = ta_g1_p2.add( 'group' );
        view.left.orientation = 'row';
        view.left.alignChildren = [ 'right', 'center' ];
        view.left.st = view.left.add( 'statictext', undefined, String.fromCharCode( 0x2192 ) );
        view.left.et = view.left.add( 'edittext', undefined, model.position.left );
        view.left.et.characters = 5;
        view.left.et.justify = 'right';
        view.left.et.helpTip = i18n.tabAlignment.absolute.helpTipLeft;
        view.left.px = view.left.add( 'statictext', undefined, 'px' );


        // Configure about tab data

        var tababout = tpanel.tabAbout = tpanel.add( 'tab' );
        tababout.text = i18n.tabAbout.title;
        tababout.orientation = 'column';
        tababout.alignChildren = [ 'fill', 'fill' ];

        view.license = tababout.license = tababout.add( 'edittext', undefined, model.license, {
            multiline: true,
            scrolling: true
        } );
        view.license.enabled = false;
        view.license.readonly = true;
        view.license.minimumSize.height = 250;
        view.license.maximumSize.height = 350;


        // Configure buttons data

        var buttons = dialog.add( 'group' );
        buttons.orientation = 'row';
        buttons.alignChildren = [ 'fill', 'center' ];
        buttons.spacing = 10;

        view.preview = buttons.add( 'button', undefined, i18n.buttons.preview );
        view.preview.helpTip = i18n.buttons.helpTipPreview;
        view.generate = buttons.add( 'button', undefined, i18n.buttons.generate );
        view.generate.helpTip = i18n.buttons.helpTipGenerate;
        view.generate.enabled = false;


        // Configure progress bar

        view.progressBar = dialog.progressBar = dialog.add( 'group' );
        view.progressBar.orientation = 'row';
        view.progressBar.alignChildren = [ 'fill', 'center' ];
        view.progressBar.spacing = 10;

        view.progressBar.pb = view.progressBar.add( 'progressbar', undefined, 0, app.documents.length );
        view.progressBar.pb.preferredSize = [ 550, 32 ];
        view.progressBar.counter = view.progressBar.add( 'statictext', undefined, '0/' + app.documents.length );
        view.progressBar.counter.preferredSize.width = 30;
        view.progressBar.counter.justify = 'right';
    };

    view.dialog.onBeforeRender = function ( dialog ) {
        view.signature.et.addEventListener( 'change', controller.onChangeSignature, false );
        view.family.ddl.addEventListener( 'change', controller.onChangeFamily, false );
        view.size.et.addEventListener( 'change', controller.onChangeSize, false );
        view.red.sl.addEventListener( 'changing', controller.onChangingRed, false );
        view.red.et.addEventListener( 'change', controller.onChangeRed, false );
        view.green.sl.addEventListener( 'changing', controller.onChangingGreen, false );
        view.green.et.addEventListener( 'change', controller.onChangeGreen, false );
        view.blue.sl.addEventListener( 'changing', controller.onChangingBlue, false );
        view.blue.et.addEventListener( 'change', controller.onChangeBlue, false );
        view.opacity.sl.addEventListener( 'changing', controller.onChangingOpacity, false );
        view.opacity.et.addEventListener( 'change', controller.onChangeOpacity, false );
        view.colorPicker.addEventListener( 'click', controller.onClickColorPicker, false );
        view.toggle.ddl.addEventListener( 'change', controller.onChangeToggle, false );
        view.topLeft.addEventListener( 'click', controller.onClickPosition, false );
        view.topRight.addEventListener( 'click', controller.onClickPosition, false );
        view.middle.addEventListener( 'click', controller.onClickPosition, false );
        view.bottomLeft.addEventListener( 'click', controller.onClickPosition, false );
        view.bottomRight.addEventListener( 'click', controller.onClickPosition, false );
        view.offsetX.et.addEventListener( 'change', controller.onChangeOffsetX, false );
        view.offsetY.et.addEventListener( 'change', controller.onChangeOffsetY, false );
        view.top.et.addEventListener( 'change', controller.onChangeTop, false );
        view.left.et.addEventListener( 'change', controller.onChangeLeft, false );
        view.preview.addEventListener( 'click', controller.onClickPreview, false );
        view.generate.addEventListener( 'click', controller.onClickGenerate, false );
    };

    controller.onChangeSignature = function () {
        model.signature = this.text;
    };

    controller.onChangeFamily = function () {
        model.font = this.selection;
    };

    controller.onChangeSize = function () {
        model.size = parseInt( this.text );
    };

    controller.onChangingRed = function () {
        model.color.r = Math.floor( this.value );
        view.red.et.text = model.color.r;
    };

    controller.onChangeRed = function () {
        model.color.r = parseInt( this.text );
        view.red.sl.value = model.color.r;
    };

    controller.onChangingGreen = function () {
        model.color.g = Math.floor( this.value );
        view.green.et.text = model.color.g;
    };

    controller.onChangeGreen = function () {
        model.color.g = parseInt( this.text );
        view.green.sl.value = model.color.g;
    };

    controller.onChangingBlue = function () {
        model.color.b = Math.floor( this.value );
        view.blue.et.text = model.color.b;
    };

    controller.onChangeBlue = function () {
        model.color.b = parseInt( this.text );
        view.blue.sl.value = model.color.b;
    };

    controller.onChangingOpacity = function () {
        model.color.opacity = Math.floor( this.value );
        view.opacity.et.text = model.color.opacity;
    };

    controller.onChangeOpacity = function () {
        model.color.opacity = parseInt( this.text );
        view.opacity.sl.value = model.color.opacity;
    };

    controller.onClickColorPicker = function () {
        var pickedColor = $.colorPicker();
        if ( pickedColor >= 0 ) {
            model.color.b = pickedColor & 255;
            view.blue.et.text = model.color.b;
            view.blue.et.notify();
            model.color.g = pickedColor >> 8 & 255;
            view.green.et.text = model.color.g;
            view.green.et.notify();
            model.color.r = pickedColor >> 16 & 255;
            view.red.et.text = model.color.r;
            view.red.et.notify();
        }
    };

    controller.onChangeToggle = function () {
        var choices = [ view.topLeft.parent.parent, view.top.parent ];
        model.alignment = this.selection.index;
        choices[ model.alignment ].enabled = true;
        choices[ Math.abs( model.alignment - 1 ) ].enabled = false;
    };

    controller.onChangeOffsetX = function () {
        model.position.offsetX = parseInt( this.text );
    };

    controller.onChangeOffsetY = function () {
        model.position.offsetY = parseInt( this.text );
    };

    controller.onChangeTop = function () {
        model.position.top = parseInt( this.text );
    };

    controller.onChangeLeft = function () {
        model.position.left = parseInt( this.text );
    };

    controller.onClickPosition = function () {
        'tl,tr,mid,bl,br'.split(',' ).forEach( function ( i ) {
            model.position[ i ] = i === this.label;
        }, this );
    };

    controller.onClickPreview = function () {
        var layer = view.signatureLayer;
        layer.text = model.signature;
        layer.font = model.font;
        layer.size = model.size;
        layer.color.r = model.color.r;
        layer.color.g = model.color.g;
        layer.color.b = model.color.b;
        layer.color.opacity = model.color.opacity;
        layer.update( model );
        view.generate.enabled = true;
        app.refresh();
    };

    controller.onClickGenerate = function () {
        var i, w, h, diag, documents = app.documents.length;

        // Calculate reference ratios from active document
        w = app.activeDocument.width;
        h = app.activeDocument.height;
        diag = Math.sqrt( w*w + h*h );
        model.ratio[0] = ( model.alignment === 0 ? model.position.offsetX : model.position.left ) / diag; // X
        model.ratio[1] = ( model.alignment === 0 ? model.position.offsetY : model.position.top ) / diag; // Y
        model.ratio[2] = model.size / diag; // font size

        // Disable preview mode and start generating signatures
        view.signatureLayer.previewMode = false;
        i = 1;
        [].slice.call( app.documents, 0 ).forEach( function ( doc ) {
            if ( doc !== model.originalDoc ) {
                view.progressBar.pb.value = i;
                view.progressBar.counter.text = (i++) + '/' + documents;
                app.activeDocument = doc;
                view.signatureLayer.docRef = doc;
                view.signatureLayer.render( model );
            }
        } );
        app.refresh();
        view.dialog.getDialog().hide();
    };

    return view.dialog;
}

/**
 * It starts the main script.
 */
function sgEntryPoint () {
    var customPrefs = {
            rulerUnits: Units.PIXELS,
            typeUnits: TypeUnits.POINTS
        },
        mvc = {
            model: {
                signature: localize( i18n.textData.placeholder ),
                font: app.fonts[ 0 ].postScriptName,
                size: 16,
                color: { r: 0, g: 0, b: 0, opacity: 100 },
                alignment: 0,
                position: {
                    tl: false, tr: false, mid: false, bl: false, br: true,
                    offsetX: 0, offsetY: 0,
                    top: 0, left: 0
                },
                ratio: [ 0, 0, 0 ],
                license: sgReadLicense()
            },
            view: {},
            controller: {}
        };

    if ( BridgeTalk.appName == 'photoshop' ) {
        try {
            if ( app.documents.length ) {
                // Save initial app state
                mvc.model.originalDoc = app.activeDocument;
                sgPreferences.init( customPrefs );

                // Create UI dialog
                sgInitDialog( mvc.model, mvc.view, mvc.controller );

                // Create testing layer on current document
                mvc.view.signatureLayer = new SGSignature( mvc.model );
                mvc.view.signatureLayer.docRef = app.activeDocument;
                mvc.view.signatureLayer.previewMode = true;
                mvc.view.signatureLayer.render( mvc.model );

                // Shows the signature onto the document jsut before the
                // dialog is created
                app.refresh();
                mvc.view.dialog.render();

                if ( mvc.view.signatureLayer.previewMode ) {
                    mvc.view.signatureLayer.remove();
                }

                // Restore initial app state
                sgPreferences.restore();
                app.activeDocument = mvc.model.originalDoc;

                // Free resources
                mvc = null;
            } else {
                alert( localize( i18n.errors.noDocuments ),
                       localize( i18n.title ) );
            }
        } catch ( e ) {
            alert( e + ':' + e.line, localize( i18n.title ), true );
        }
    }
}

sgEntryPoint();
