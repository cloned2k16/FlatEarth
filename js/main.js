/*
    Copyright (c) 2021 , Paolo Lioy

    bla blabla blablabla ..
*/

var     defFillC    =   '#000'
    ,   defStrokeC  =   '#eff'
    ,   Hh          =    1.65   // mt
    ,   FAR         =   64      // km
    ,   R           = 6369      // km
    ,   ofsY        = 1/10		// pushes Earth up
    ,   zoomX       = 4			// X zoom factor
    ,   zoomY       = 100		// Y zoom factor
    ;


const   ND      = undefined
    ,   FN                      =   Function.apply
    ,   round2                  =   (n)             =>  { return Math.round(( n + Number.EPSILON) * 100) / 100;                     }
    ,   _log                    =   function ()         { FN.call(console.log  , console, arguments);                               }
    ,   _err                    =   function ()         { FN.call(console.error, console, arguments);                               }
    ,   url     = new URL(window.location)
    ,   query   = window.location.search.substring(1)
    ,   gfx     = document.getElementById('display')
    ,   getEl   = ( id )                            => {
            let     d=document
                ,   e=d.getElementById(id)
                ;
                return {
                 el : e
                }
        }
    ,   params  = ( nm )                            => {
        return url.searchParams.get(nm);
    }

    ,   ctx     = gfx.getContext('2d')
    ,   width   = gfx.width
    ,   height  = gfx.height
    ,   cX      = width / 2
    ,   cY      = height * ofsY
    ,   PI      = Math.PI
    ,   PI2     = 2*PI
    ,   circle  = (x,y,r,strokeC,fillC,r2)          => {
                    x =cX+(  x)*zoomX
                    y =cY+R*zoomY-y*zoomY
                    ctx.beginPath();
                    var ry=r;
                    if (r2!=ND) {
                        ry=r2;
                        ctx.ellipse(x,y,r, r2,0,PI2,false);
                    }
                    else ctx.arc(x,y,r,0,PI2,false);
                    if (fillC != ND) {
                        defFillC        =
                        ctx.fillStyle   = fillC;
                        ctx.fill();
                    }
                    ctx.lineWidth = 1;
                    if ( ND != strokeC ){
                        defStrokeC      =
                        ctx.strokeStyle = strokeC ;
                    }
                    else {
                        ctx.strokeStyle = defStrokeC ;
                    }
                    ctx.stroke();
                    return  {
                        text: ( txt,font ) => {
                             ctx.font = "12px Arial";
                             ctx.fillStyle = "black";
                             ctx.textAlign = "center";
                             ctx.fillText(txt, x,y-10);
                        }
                    };
                }
    ,   line    = (x,y,x1,y1,strokeC)               => {
                    x =cX+(  x)*zoomX
                    y =cY+R*zoomY-y*zoomY
                    x1 =cX+(x1)*zoomX
                    y1 =cY+R*zoomY-y1*zoomY
                    ctx.beginPath();
                    ctx.lineWidth = 1;
                    if ( ND != strokeC ){
                        defStrokeC      =
                        ctx.strokeStyle = strokeC ;
                    }
                    else {
                        ctx.strokeStyle = defStrokeC ;
                    }
                    ctx.moveTo(x,y);
                    ctx.lineTo(x1,y1);
                    ctx.stroke();
        }
    ;

let     pA       = params('A')      || FAR
    ,   pCD      = params('CD')     || Hh
    ,   zx       = params('zx')     || zoomX
    ,   zy       = params('zy')     || zoomY
    ;

    getEl('A') .el.value=pA;
    getEl('CD').el.value=pCD;
    getEl('zx').el.value=zx;
    getEl('zy').el.value=zy;

    FAR     = pA;
    Hh      = pCD/1000;
    zoomX   = zx;
    zoomY   = zy;

let     pov     = R+Hh
    ,   horT    = Math.sqrt ( pov*pov - R*R )                   //  tangent
    ,   horA    = Math.atan ( horT/R )                          //  arc to horizon in radian
    ,   horX    = Math.sin  ( horA )
    ,   horY    = Math.cos  ( horA )
    ,   arc0    = horA * R                                      //  Arc len till horizon
    ,   farArc  = FAR-arc0                                      //  Arc len after
    ,   farAngl = farArc/R
    ,   farX    = Math.sin  ( farAngl )
    ,   farY    = Math.cos  ( farAngl )
    ,   farTan  = Math.tan  ( farAngl )
    ,   farKm   = farTan * R
    ,   ALen    = Math.sqrt ( R*R + farKm*farKm ) - R
    ,   aR      = ALen + R
	,	mt		= round2(ALen*1e3)
    ;

    //_log((horT-arc0)*1e3,farAngl);

    ctx.fillStyle	= "black";
    ctx.textAlign	= "center";
    
    ctx.font 		= "10px Arial";
    ctx.fillText('Radius:  '+round2(R)   +' Km.', 144,11);
	
    ctx.font 		= "12px Arial";
    ctx.fillText('Horizon: '+round2(arc0)+' Km.', 144,22);

    ctx.font 		= "16px Arial";
    ctx.fillText('AZ is: '	+mt+' Mt.'			, 144,45);

    circle              (0, 0    , R*zoomX                          ,'#693', '#fafdfc', R*zoomY);           //  Earth
    line                (0,0,0, R+R                                 ,'#888');                               //  Vertical
    line                (-cX/zoomX,R,cX/zoomX, R                    ,'#888');                               //  Horizontal

    line                (0,0,-farX*aR   , farY*aR                   ,'#FD0');
    line                (0,0,-farX*R    , farY*R                    ,'#40E');
    line                (horX*pov  , horY*pov,-farX*aR  , farY*aR   ,'#F4F','+');

    line                (horX*R,horY*R,horX*pov , horY*pov          ,'#40E');
    line                (0,0,horX*R     , horY*R                    ,'#4fa');
    circle              (horX*pov   , horY*pov  , 4     , '#39e'    ).text('CD')                            //  Camera
    circle              (0          , R         , 3     , '#F39'    ).text('')                              //  horizon
    circle              (-horX*pov  , horY*pov  , 3     , '#8E6'    ).text('F')                             //  F point on tangent

    circle              (-farX*aR   , farY*aR   , 5                 ).text('A')                             //  A point on Tangent
    circle              (-farX*R    , farY*R    , 3     , '#DE8'    ).text('    Z')                         //  A point on Earth



