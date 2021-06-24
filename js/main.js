/*
    Copyright (c) 2021 , Paolo Lioy

    bla blabla blablabla ..
*/ 

var     defFillC    =   '#000'
    ,   defStrokeC  =   '#eff'
    ,   Hh          =    1.959  // 	mt
    ,   FAR         =   64      // 	km
    ,   R           = 6369      // 	km  ( I like the number ;) )
    ,   ofsY        = 1/8		// 	pushes Earth up
    ,   zoomX       = 7			// 	X zoom factor
    ,   zoomY       = 200		// 	Y zoom factor
	,	hElev       = 0			// 	elevation at horizon
	,   dElev       = 0 		//	elevation at camera POV	
	,	T           = 426
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
					el 		: e
				 ,	floatV 	: () => { return parseFloat(el.value.replace(',','.')) }
				 ,	intV   	: () => { return parseInt(el) }
                }
        }
    ,   param   = ( nm )                            => {
        return url.searchParams.get(nm);
    }
    ,   paramF  = ( nm )                            => {
        if (param(nm)==ND) return ND; else return parseFloat(param(nm).replace(',','.'));
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
                             ctx.font = "10px Arial";
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

let     pA       = paramF('A')      || FAR
    ,   pCD      = paramF('CD')     || Hh
    ,   zx       = paramF('zx')     || zoomX
    ,   zy       = paramF('zy')     || zoomY
	,   RR       = paramF('ray')    || R
	,   elevH    = paramF('elevH')  || hElev
	,   elevD    = paramF('elevD')  || dElev
	,	Te       = paramF('T')      || T
    ;

    getEl('A')  .el.value=pA;
    getEl('CD') .el.value=pCD;
    getEl('zx') .el.value=zx;
    getEl('zy') .el.value=zy;
    getEl('ray').el.value=RR;
	getEl('T')	.el.value=Te;
	//getEl('elevH').el.value= elevH;
	//getEl('elevD').el.value= elevD;

    FAR     = pA;
    Hh      = pCD/1000;
    zoomX   = zx;
    zoomY   = zy;
	R       = RR;
	T       = Te/1000;
	//hElev   = elevH;
	//dElev   = elevD;


var     pov     
	,	HR      
    ,   horT    
    ,   horA    
    ,   horX    
    ,   horY    
    ,   arc0    
    ,   farArc  
    ,   farAngl 
    ,   farX    
    ,   farY    
    ,   farTan  
    ,   farKm   
    ,   ALen    
    ,   aR      
	,	mt		
	,   tR      
	,   ta      
	,	recalc  = () => {
		pov     = R+Hh+(elevD/1e3)
		HR      = R+(elevH/1e3)
		horT    = Math.sqrt ( pov*pov - R*R )                   //  tangent
		horA    = Math.atan ( horT/R )                          //  arc to horizon in radian
		horX    = Math.sin  ( horA )
		horY    = Math.cos  ( horA )
		horY    = Math.cos  ( horA )
		arc0    = horA * R                                      //  Arc len till horizon
		farArc  = FAR-arc0                                      //  Arc len after
		farAngl = farArc/R
		farX    = Math.sin  ( farAngl )
		farY    = Math.cos  ( farAngl )
		farTan  = Math.tan  ( farAngl )
		farKm   = farTan * R
		ALen    = Math.sqrt ( R*R + farKm*farKm ) - R
		aR      = ALen + R
		mt		= round2(ALen*1e3)
		tR      = T+R
		ta      = round2(T*1e3-mt)      
	}
    ;
	
	recalc();

    //_log((horT-arc0)*1e3,farAngl);

    ctx.fillStyle	= "black";
    ctx.textAlign	= "center";

    ctx.font 		= "20px Arial";
    ctx.fillText('PlaneT Earth (scaled)'				, 888,33);
    
    ctx.font 		= "10px Arial";
    ctx.fillText('Radius:  '+round2(R)   +' Km.'		, 144,11);
	
    ctx.font 		= "12px Arial";
    ctx.fillText('Horizon: '+round2(arc0)+' Km.'		, 144,27);

    ctx.font 		= "16px Arial";
    ctx.fillText('AZ is: '	+mt+' Mt.'					, 144,65);

    ctx.fillText('TA is: '	+ta+' Mt.'	    		    , 144,45);


    circle              (0, 0    , R*zoomX                          ,'#693', '#fafdfc'	, R*zoomY);          //  Earth
    line                (0,0,0, R+R                                 ,'#eee');                               //  Vertical
    line                (-cX/zoomX,R,cX/zoomX, R                    ,'#eee');                               //  Horizontal

		var vR= R+(hElev/1e3);
	if (hElev!=0 ){
		//circle              (0, 0    , vR*zoomX                     ,'#Fcc',  ND		,vR*zoomY);     	//  Virt Earth
		line                (-cX/zoomX,vR,cX/zoomX, vR              ,'#Fdd');                           	//  Virt Horizon
	}
	
	R=R-(elevH/1e3)
    line                (0,0,-farX*aR   , farY*aR                   ,'#FD0');
    line                (0,0,-farX*R    , farY*R                    ,'#40E');
    line                (horX*pov  , horY*pov,-farX*aR  , farY*aR   ,'#F4F','+');
    line                (-farX*tR   , farY*tR,-farX*aR   , farY*aR                   ,'#F08');

    line                (horX*R,horY*R,horX*pov , horY*pov          ,'#40E');
    line                (0,0,horX*R     , horY*R                    ,'#4fa');
	
    circle              (horX*pov   , horY*pov  	, 4     , '#39e'    ).text('CD')                            //  Camera
    circle              (horX*R     , horY*R    	, 3     , '#39e'    )                                       //  Ground
    circle              (0          , R+(elevH/1e3)	, 3     , '#F39'    ).text('')                              //  horizon
    circle              (-horX*pov  , horY*pov  	, 3     , '#8E6'    ).text('F')                             //  F point on tangent

    circle              (-farX*aR   , farY*aR   	, 3                 ).text('A    ')                         //  A point on Tangent
    circle              (-farX*R    , farY*R    	, 3     , '#DA8'    ).text('    Z')                         //  A point on Earth

    circle              (-farX*tR   , farY*tR    	, 3     , '#FAD'    ).text('    T')                         //  Elevation over horizon

	var 
	 	step 	= 0.002
	,   ele     = step
	,   Fa      = arc0
	;
	
	while (true) {
		Hh=ele;
		ele+=step;
		recalc();	  
		circle              ( horX*pov  , horY*pov    	, 2     , '#aef'    )       
		circle              (-farX*tR    , farY*tR    	, 1     , '#ddf'    )
		if ( farArc < 0) break;
	}
        circle              ( horX*pov  , horY*pov    	, 2     , '#faa'    ).text(''+round2(ele*1e3)+' Mt.');       
	
	Hh=pCD/1000;
	step=1; //km
	FAR=Fa;
    ctx.fillText('FAR min: '	+round2(FAR)+' Km.'	    		    , 628,222);
	while (true) {
		recalc();	  
        circle              (-farX*tR   , farY*tR    	, 1     , '#fa7'    )       
		FAR+=step;
		if ( ALen > T ) break; 
	}
    ctx.fillText('FAR max: '	+round2(FAR)+' Km.'	    		    , 628,242);
        
