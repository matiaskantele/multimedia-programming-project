
var waterVertexShader = "																												\n\
	uniform sampler2D noiseTexture;																										\n\
	uniform float noiseScale;																											\n\
																																		\n\
	uniform sampler2D bumpTexture;																										\n\
	uniform float bumpSpeed;																											\n\
	uniform float bumpScale;																											\n\
																																		\n\
	uniform float time;																													\n\
																																		\n\
	varying vec2 vUv;																													\n\
																																		\n\
	void main()																															\n\
	{ 																																	\n\
		vUv = uv;																														\n\
																																		\n\
		vec2 uvTimeShift = vUv + vec2( 1.1, 1.9 ) * time * bumpSpeed;																	\n\
		vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );															\n\
		vec2 uvNoiseTimeShift = vUv + noiseScale * vec2( noiseGeneratorTimeShift.r, noiseGeneratorTimeShift.g );						\n\
		// below, using uvTimeShift seems to result in more of a rippling effect														\n\
		//   while uvNoiseTimeShift seems to result in more of a shivering effect														\n\
		vec4 bumpData = texture2D( bumpTexture, uvTimeShift );																			\n\
																																		\n\
		// move the position along the normal																							\n\
		//  but displace the vertices at the poles by the same amount																	\n\
		float displacement = ( vUv.y > 0.999 || vUv.y < 0.001 ) ? 																		\n\
		    bumpScale * (0.3 + 0.02 * sin(time)) :  																					\n\
		    bumpScale * bumpData.r;																										\n\
		vec3 newPosition = position + normal * displacement;																			\n\
																																		\n\
		gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );													\n\
	}																																	\n\
"

var waterFragmentShader = "																												\n\
	uniform sampler2D baseTexture;																										\n\
	uniform float baseSpeed;																											\n\
	uniform float repeatS;																												\n\
	uniform float repeatT;																												\n\
																																		\n\
	uniform sampler2D noiseTexture;																										\n\
	uniform float noiseScale;																											\n\
																																		\n\
	uniform sampler2D blendTexture;																										\n\
	uniform float blendSpeed;																											\n\
	uniform float blendOffset;																											\n\
																																		\n\
	uniform float time;																													\n\
	uniform float alpha;																												\n\
																																		\n\
	varying vec2 vUv;																													\n\
																																		\n\
	void main()																															\n\
	{																																	\n\
		vec2 uvTimeShift = vUv + vec2( -0.7, 1.5 ) * time * baseSpeed;  																\n\
		vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );															\n\
		vec2 uvNoiseTimeShift = vUv + noiseScale * vec2( noiseGeneratorTimeShift.r, noiseGeneratorTimeShift.b );						\n\
		vec4 baseColor = texture2D( baseTexture, uvNoiseTimeShift * vec2(repeatS, repeatT) );											\n\
																																		\n\
		vec2 uvTimeShift2 = vUv + vec2( 1.3, -1.7 ) * time * blendSpeed;																\n\
		vec4 noiseGeneratorTimeShift2 = texture2D( noiseTexture, uvTimeShift2 );														\n\
		vec2 uvNoiseTimeShift2 = vUv + noiseScale * vec2( noiseGeneratorTimeShift2.g, noiseGeneratorTimeShift2.b );						\n\
		vec4 blendColor = texture2D( blendTexture, uvNoiseTimeShift2 * vec2(repeatS, repeatT) ) - blendOffset * vec4(1.0, 1.0, 1.0, 1.0);\n\
																																		\n\
		vec4 theColor = baseColor + blendColor;																							\n\
		theColor.a = alpha;																												\n\
		gl_FragColor = theColor;																										\n\
	}																																	\n\
"


var sandVertexShader = "																												\n\
	uniform sampler2D noiseTexture;																										\n\
	uniform float noiseScale;																											\n\
																																		\n\
	uniform sampler2D bumpTexture;																										\n\
	uniform float bumpSpeed;																											\n\
	uniform float bumpScale;																											\n\
																																		\n\
	uniform float time;																													\n\
																																		\n\
	varying vec2 vUv;																													\n\
																																		\n\
	void main()																															\n\
	{ 																																	\n\
		vUv = uv;																														\n\
																																		\n\
		vec2 uvTimeShift = vUv + vec2( 1.1, 1.9 ) * time * bumpSpeed;																	\n\
		vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );															\n\
		vec2 uvNoiseTimeShift = vUv + noiseScale * vec2( noiseGeneratorTimeShift.r, noiseGeneratorTimeShift.g );						\n\
		// below, using uvTimeShift seems to result in more of a rippling effect														\n\
		//   while uvNoiseTimeShift seems to result in more of a shivering effect														\n\
		vec4 bumpData = texture2D( bumpTexture, uvTimeShift );																			\n\
																																		\n\
		// move the position along the normal																							\n\
		//  but displace the vertices at the poles by the same amount																	\n\
		float displacement = ( vUv.y > 0.999 || vUv.y < 0.001 ) ?																		\n\
		    bumpScale * (0.3 + 0.02 * sin(time)) :																						\n\
		    bumpScale * bumpData.r;																										\n\
		vec3 newPosition = position + normal * displacement;																			\n\
																																		\n\
		gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );													\n\
	}																																	\n\
"

var sandFragmentShader = "																												\n\
	uniform sampler2D baseTexture;																										\n\
	uniform float baseSpeed;																											\n\
	uniform float repeatS;																												\n\
	uniform float repeatT;																												\n\
																																		\n\
	uniform sampler2D noiseTexture;																										\n\
	uniform float noiseScale;																											\n\
																																		\n\
	uniform sampler2D blendTexture;																										\n\
	uniform float blendSpeed;																											\n\
	uniform float blendOffset;																											\n\
																																		\n\
	uniform float time;																													\n\
	uniform float alpha;																												\n\
																																		\n\
	varying vec2 vUv;																													\n\
																																		\n\
	void main()																															\n\
	{																																	\n\
		vec2 uvTimeShift = vUv + vec2( -0.7, 1.5 ) * time * baseSpeed;																	\n\
		vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );															\n\
		vec2 uvNoiseTimeShift = vUv + noiseScale * vec2( noiseGeneratorTimeShift.r, noiseGeneratorTimeShift.b );						\n\
		vec4 baseColor = texture2D( baseTexture, uvNoiseTimeShift * vec2(repeatS, repeatT) );											\n\
																																		\n\
		vec2 uvTimeShift2 = vUv + vec2( 1.3, -1.7 ) * time * blendSpeed;																\n\
		vec4 noiseGeneratorTimeShift2 = texture2D( noiseTexture, uvTimeShift2 );														\n\
		vec2 uvNoiseTimeShift2 = vUv + noiseScale * vec2( noiseGeneratorTimeShift2.g, noiseGeneratorTimeShift2.b );						\n\
		vec4 blendColor = texture2D( blendTexture, uvNoiseTimeShift2 * vec2(repeatS, repeatT) ) - blendOffset * vec4(1.0, 1.0, 1.0, 1.0);\n\
																																		\n\
		vec4 theColor = baseColor + blendColor;																							\n\
		theColor.a = alpha;																												\n\
		gl_FragColor = theColor;																										\n\
	}																																	\n\
"
