function createSphereGeodesic(radius, subdivision) {
    var X  = 0.525731112119133606;
    var Z  = 0.850650808352039932;

    var vdata = [    
        [-X, 0.0, Z], [X, 0.0, Z],  [-X, 0.0, -Z], [X, 0.0, -Z],    
        [0.0, Z, X],  [0.0, Z, -X], [0.0, -Z, X],  [0.0, -Z, -X],    
        [Z, X, 0.0],  [-Z, X, 0.0], [Z, -X, 0.0],  [-Z, -X, 0.0] 
    ];
    
    var tindices = [ 
        [0,4,1],  [0,9,4],  [9,5,4],  [4,5,8],  [4,8,1],    
        [8,10,1], [8,3,10], [5,3,8],  [5,2,3],  [2,7,3],    
        [7,10,3], [7,6,10], [7,11,6], [11,0,6], [0,1,6], 
        [6,1,10], [9,0,11], [9,11,2], [9,2,5],  [7,2,11] ];

    function normalize(a) {
        var d = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
        a[0]/=d; a[1]/=d; a[2]/=d;
    }

    function epsilon(t,x) {
        return Math.abs(t-x)<0.001;
    }
    
    function drawtri(a, b, c, div, r, data) {
        var d,u1,u2,u3,v1,v2,v3;
        
        if(div <= 0) {
            // normals
            if(data.flat) {
                var n0 = (a[0]+b[0]+c[0])/3;
                var n1 = (a[1]+b[1]+c[1])/3;
                var n2 = (a[2]+b[2]+c[2])/3;
                data.normals.push(n0);
                data.normals.push(n1);
                data.normals.push(n2);
                
                data.normals.push(n0);
                data.normals.push(n1);
                data.normals.push(n2);
                
                data.normals.push(n0);
                data.normals.push(n1);
                data.normals.push(n2);
            }
            else {
                data.normals.push(a[0]);
                data.normals.push(a[1]);
                data.normals.push(a[2]);
                
                data.normals.push(b[0]);
                data.normals.push(b[1]);
                data.normals.push(b[2]);
                
                data.normals.push(c[0]);
                data.normals.push(c[1]);
                data.normals.push(c[2]);
            }
            
            // vertices
            data.vertices.push(a[0]*r);
            data.vertices.push(a[1]*r);
            data.vertices.push(a[2]*r);

            data.vertices.push(b[0]*r);
            data.vertices.push(b[1]*r);
            data.vertices.push(b[2]*r);
            
            data.vertices.push(c[0]*r);
            data.vertices.push(c[1]*r);
            data.vertices.push(c[2]*r);
                        
            // indices
            var n = data.indices.length;
            data.indices.push(n);
            data.indices.push(n+1);
            data.indices.push(n+2);
            
            // texture coordinates
            var scale = 1;
            var s = scale, t = scale;
            var tt = 0.75;
            var nn = 1 - tt;
            
            u1 = Math.atan2(a[0], a[2]) / (2*Math.PI) + 0.5;
            v1 = Math.asin(a[1]) / Math.PI + 0.5;
            
            u2 = Math.atan2(b[0], b[2]) / (2*Math.PI) + 0.5;
            v2 = Math.asin(b[1]) / Math.PI + 0.5;
            
            u3 = Math.atan2(c[0], c[2]) / (2*Math.PI) + 0.5;
            v3 = Math.asin(c[1]) / Math.PI + 0.5;
            
            // fix texture mapping at wrap boundary
            if(Math.abs(u1-u2) > tt) { 
                if(u1<nn) u1 += 1;
                if(u2<nn) u2 += 1;
                if(u3<nn) u3 += 1;
            }
            else if(Math.abs(u1-u3) > tt) { 
                if(u1<nn) u1 += 1;
                if(u2<nn) u2 += 1;
                if(u3<nn) u3 += 1;
            }
            else if(Math.abs(u2-u3) > tt) { 
                if(u1<nn) u1 += 1;
                if(u2<nn) u2 += 1;
                if(u3<nn) u3 += 1;
            }
            
            // fix texture mapping at poles
            if(epsilon(1,v1)) { u1 = 0.5*(u2+u3); }
            if(epsilon(1,v2)) { u2 = 0.5*(u1+u3); }
            if(epsilon(1,v3)) { u3 = 0.5*(u1+u2); }
            
            if(epsilon(0,v1)) { u1 = 0.5*(u2+u3); }
            if(epsilon(0,v2)) { u2 = 0.5*(u1+u3); }
            if(epsilon(0,v3)) { u3 = 0.5*(u1+u2); }
            
            data.uvs.push(s*u1);
            data.uvs.push(t*v1);
            
            data.uvs.push(s*u2);
            data.uvs.push(t*v2);
            
            data.uvs.push(s*u3);
            data.uvs.push(t*v3);
            
            // colors
            var rr = Math.random();
            var gg = Math.random();
            var bb = Math.random();
            var aa = 1.0;
            for(var i=0; i<3; ++i) {
                data.colors.push(rr);
                data.colors.push(gg);
                data.colors.push(bb);
                data.colors.push(aa);
            }
        } 
        else {
            var ab = [], ac = [], bc = [];
            for(var i=0; i<3; i++) {
                ab[i] = (a[i]+b[i])/2;
                ac[i] = (a[i]+c[i])/2;
                bc[i] = (b[i]+c[i])/2;
            }
            normalize(ab); normalize(ac); normalize(bc);
            drawtri(a, ab, ac, div-1, r, data);
            drawtri(b, bc, ab, div-1, r, data);
            drawtri(c, ac, bc, div-1, r, data);
            drawtri(ab, bc, ac, div-1, r, data);  //<--Comment this line and sphere looks really cool!
        }  
    }

    function createSphereGeodesicData(ndiv, radius, data) {
        for(var i=0; i<tindices.length; i++)
            drawtri(vdata[tindices[i][0]], vdata[tindices[i][1]], vdata[tindices[i][2]], ndiv, radius, data);
    }
    
    var data = {
        'vertices':[],
        'normals' :[],
        'indices' :[],
        'uvs'     :[],
        'colors'  :[],
        'flat'    :0
    }
    createSphereGeodesicData(subdivision, radius, data);
    
    return createObject(data);
}