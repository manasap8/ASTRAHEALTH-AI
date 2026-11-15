import { useMission } from '../../context/MissionContext'
import { BODY_REGIONS } from '../../data/missionData'
import { StatusPill, STATUS_ACCENT } from '../ui/StatusPill'
import { ToggleSwitch } from '../ui/ToggleSwitch'
import { useState, useEffect, useRef } from 'react'

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const HUMAN_MODEL_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/r187/examples/models/gltf/Xbot.glb'

export function DigitalTwin() {
  const {
    readings,
    regionStatuses,
    selectedRegion,
    setSelectedRegion,
    selectedAstronaut,
  } = useMission()

  const [preFlightView, setPreFlightView] = useState(true)
  const [modelStatus, setModelStatus] = useState('loading')
  const visualizationRef = useRef(null)
  const sceneControllerRef = useRef(null)
  const selectedRegionRef = useRef(selectedRegion)

  useEffect(() => {
    selectedRegionRef.current = selectedRegion
    sceneControllerRef.current?.setSelectedRegion(selectedRegion)
  }, [selectedRegion])

  useEffect(() => {
    const sceneController = initThreeScene(
      visualizationRef.current,
      setSelectedRegion,
      setModelStatus,
    )
    sceneControllerRef.current = sceneController
    sceneController.setSelectedRegion(selectedRegionRef.current)

    return () => {
      sceneControllerRef.current = null
      sceneController.dispose()
    }
  }, [setSelectedRegion])

  const selected = BODY_REGIONS.find((region) => region.id === selectedRegion) ?? BODY_REGIONS[0]
  const selectedStatus = regionStatuses[selected.id]

  const toggleView = () => setPreFlightView((v) => !v)

  const getRegionHealth = (regionId, view = 'current') => {
    const astronaut = selectedAstronaut
   if (view === 'preflight') {
  const baseline = astronaut.preFlight?.baseline

  if (!baseline) return null

  return {
    heartRate: baseline.heartRate,
    spo2: baseline.spo2,
    temperature: baseline.temperature,
    respiration: baseline.respiration,
    sleep: baseline.sleep,
    radiation: baseline.radiation,
  }
}
    return readings ?? astronaut.currentReadings
  }

  const handleRegionClick = (id) => {
    setSelectedRegion(id)
  }

  return (
    <section id="digital-twin" className="glass-panel hud-corners relative overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 3D Canvas section */}
        <div className="flex-1 sm:pr-4">
          <div
            ref={visualizationRef}
            role="img"
            aria-label="Three-dimensional holographic astronaut anatomy model"
            aria-busy={modelStatus === 'loading'}
            className="relative h-[380px] w-full sm:h-[420px] rounded-xl border border-cyan-300/[0.12] bg-[radial-gradient(ellipse_at_50%_45%,rgba(14,116,144,0.14),transparent_65%),rgba(3,9,18,0.7)]"
          >
            {modelStatus !== 'ready' && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-slate-950/70 px-4 text-center">
                {modelStatus === 'loading' ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-200/80">
                    Loading holographic anatomy model…
                  </p>
                ) : (
                  <p role="alert" className="max-w-sm text-[11px] leading-relaxed text-rose-200">
                    The 3D anatomy model could not be loaded. Check your internet connection and
                    refresh the page to try again.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Health information panel */}
        <div className="flex flex-col gap-4 sm:w-[380px]">
          {/* Pre-Flight / Current toggle */}
          <div className="glass-panel p-3 rounded-xl border border-white/[0.06] bg-white/[0.025]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.1em] text-slate-500">View</span>
              <ToggleSwitch
                checked={preFlightView}
                onChange={toggleView}
                label="Pre-Flight"
              />
              <span
                className="text-[9px] uppercase tracking-[0.1em] text-slate-500 ml-2"
              >
                Current
              </span>
            </div>
          </div>

          {/* Selected region panel */}
          <div className="glass-panel p-4 rounded-xl border border-white/[0.06] bg-white/[0.025]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="panel-title text-[12px] font-semibold text-slate-100">
                {selected.label}
              </h3>
              <StatusPill
                level={selectedStatus.level}
                label={selectedStatus.label}
              />
            </div>

            {/* Health stats for the selected region */}
            {getRegionHealth(selected.id, preFlightView ? 'preflight' : 'current') ? (
            <div className="space-y-3">
              <div>
                <div className="font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
                  Heart rate
                </div>
                <div className="mt-1 font-mono text-[13px] font-medium text-slate-200">
                  {Number(
                    getRegionHealth(selected.id, preFlightView ? 'preflight' : 'current')
                      .heartRate
                  ).toFixed(0)} BPM</div>
                <div className="mt-1 font-mono text-[7px] text-slate-500">
                  {' '}{preFlightView ? 'vs pre-flight baseline' : 'live simulation'}
                </div>
              </div>

              <div>
                <div className="font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
                  SpO₂
                </div>
                <div className="mt-1 font-mono text-[13px] font-medium text-slate-200">
                  {Math.round(
                    getRegionHealth(selected.id, preFlightView ? 'preflight' : 'current')
                      .spo2
                  )}%</div>
                <div className="mt-1 font-mono text-[7px] text-slate-500">
                  {' '}{preFlightView ? 'vs pre-flight baseline' : 'live simulation'}
                </div>
              </div>

              <div>
                <div className="font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
                  Body temp
                </div>
                <div className="mt-1 font-mono text-[13px] font-medium text-slate-200">
                  {Number(
                    getRegionHealth(selected.id, preFlightView ? 'preflight' : 'current')
                      .temperature
                  ).toFixed(1)} °C</div>
                <div className="mt-1 font-mono text-[7px] text-slate-500">
                  {' '}{preFlightView ? 'vs pre-flight baseline' : 'live simulation'}
                </div>
              </div>

              <div>
                <div className="font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
                  Respiration
                </div>
                <div className="mt-1 font-mono text-[13px] font-medium text-slate-200">
                  {Math.round(
                    getRegionHealth(selected.id, preFlightView ? 'preflight' : 'current')
                      .respiration
                  )} br/min</div>
                <div className="mt-1 font-mono text-[7px] text-slate-500">
                  {' '}{preFlightView ? 'vs pre-flight baseline' : 'live simulation'}
                </div>
              </div>

              {preFlightView && (
                <div>
                  <div className="font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
                    Sleep
                  </div>
                  <div className="mt-1 font-mono text-[13px] font-medium text-slate-200">
                    {Number(
                      getRegionHealth(selected.id, preFlightView ? 'preflight' : 'current')
                        .sleep
                    ).toFixed(1)} h</div>
                  <div className="mt-1 font-mono text-[7px] text-slate-500">
                    Pre-flight baseline reference
                  </div>
                </div>
              )}

              <div>
                <div className="font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
                  Radiation
                </div>
                <div className="mt-1 font-mono text-[13px] font-medium text-slate-200">
                  {Number(
                    getRegionHealth(selected.id, preFlightView ? 'preflight' : 'current')
                      .radiation
                  ).toFixed(2)} mSv</div>
                <div className="mt-1 font-mono text-[7px] text-slate-500">
                  Cumulative mission dose</div>
              </div>
            </div>
            ) : (
  <p className="text-sm text-slate-400">
    No health readings are available for this astronaut yet.
  </p>
)}

            {/* Emergency connection */}
            <div className="mt-3 p-3 rounded-lg border border-rose-400/20 bg-rose-500/[0.05]">
              <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-rose-300/70">
                Emergency integration
              </div>
              <p className="mt-1 text-[9px] leading-relaxed text-rose-300/80">
                When emergency mode is active, the corresponding organ region will highlight
                in the 3D twin and display associated health readings and symptoms.
              </p>
              <button
                type="button"
                onClick={() => {}}
                className="mt-2 text-[9px] text-rose-300/70 hover:text-rose-300 transition"
              >
                Close
              </button>
            </div>
          </div>

          {/* Body region quick selectors */}
          <div className="glass-panel p-3 rounded-xl border border-white/[0.06] bg-white/[0.025]">
            <div className="font-mono text-[7px] uppercase tracking-[0.12em] text-slate-600">
              Quick selection
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {BODY_REGIONS.map((region) => {
                const status = regionStatuses[region.id]
                const active = selected.id === region.id
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => handleRegionClick(region.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[8px] transition ${active
                      ? 'border-cyan-300/30 bg-cyan-400/[0.08] text-cyan-200'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-cyan-300/20 hover:text-cyan-200'}`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full ${STATUS_ACCENT[status.level]?.color}`}
                    />
                    <span className="truncate">{region.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison summary at bottom */}
      <div className="mt-4 pt-4 border-t border-white/[0.05] text-[9px] uppercase tracking-[0.08em] text-slate-600">
        Pre-Flight: original medical examination data · Current: simulated mission telemetry ·
        All readings are generated frontend demonstration data
      </div>
    </section>
  )
}

function initThreeScene(container, onRegionSelect, onModelStateChange) {
  let disposed = false
  let renderer
  let animationId
  let resizeObserver
  let loadRequest
  let mixer
  let selectedRegion = 'heart'
  const regionMarkers = new Map()
  const markerMeshes = []
  const controller = {
    setSelectedRegion: (regionId) => {
      selectedRegion = regionId
      regionMarkers.forEach((group, id) => {
        const active = id === selectedRegion
        group.scale.setScalar(active ? 1.25 : 1)
        group.traverse((object) => {
          if (object.isMesh) object.material.opacity = active ? 1 : 0.62
        })
      })
    },
    dispose: () => {},
  }

  if (!container) return controller

  try {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      1000,
    )
    camera.position.set(0, 0, 660)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x050810, 0)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'
    container.appendChild(renderer.domElement)

    const hologram = new THREE.Group()
    scene.add(hologram)

    const addMarker = (regionId, color, markers, depth) => {
      const group = new THREE.Group()
      markers.forEach(({ position, scale }) => {
        const material = new THREE.MeshStandardMaterial({
          color,
          depthWrite: false,
          emissive: color,
          emissiveIntensity: 1.4,
          opacity: 0.62,
          roughness: 0.35,
          transparent: true,
        })
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), material)
        mesh.position.set(position[0], position[1], depth + position[2])
        mesh.scale.set(...scale)
        mesh.userData.regionId = regionId
        group.add(mesh)
        markerMeshes.push(mesh)
      })
      hologram.add(group)
      regionMarkers.set(regionId, group)
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const onPointerDown = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const [hit] = raycaster.intersectObjects(markerMeshes, false)
      if (hit?.object.userData.regionId) {
        onRegionSelect(hit.object.userData.regionId)
      }
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    const ambient = new THREE.HemisphereLight(0xbdeeff, 0x10243a, 2)
    scene.add(ambient)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
    keyLight.position.set(-80, 120, 220)
    scene.add(keyLight)

    const timer = new THREE.Timer()
    timer.connect(document)
    function animate() {
      animationId = requestAnimationFrame(animate)
      timer.update()
      const delta = timer.getDelta()
      mixer?.update(delta)
      hologram.rotation.y = Math.sin(timer.getElapsed() * 0.25) * 0.08
      renderer.render(scene, camera)
    }
    animate()

    function onResize() {
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(container)

    const loader = new GLTFLoader()
    loadRequest = loader.load(
      HUMAN_MODEL_URL,
      (gltf) => {
        if (disposed) {
          disposeSceneResources(gltf.scene)
          return
        }

        try {
          const bounds = new THREE.Box3().setFromObject(gltf.scene)
          const size = bounds.getSize(new THREE.Vector3())
          const center = bounds.getCenter(new THREE.Vector3())
          if (!Number.isFinite(size.y) || size.y <= 0) {
            throw new Error('The downloaded human model has invalid dimensions.')
          }

          const modelScale = 390 / size.y
          const modelDepth = size.z * modelScale
          gltf.scene.scale.setScalar(modelScale)
          gltf.scene.position.set(
            -center.x * modelScale,
            -center.y * modelScale,
            -center.z * modelScale,
          )
          const discardedMaterials = new Set()
          const discardedTextures = new Set()
          const hologramMaterial = new THREE.MeshStandardMaterial({
            color: 0x55dff2,
            depthWrite: false,
            emissive: 0x006274,
            emissiveIntensity: 0.8,
            metalness: 0.12,
            opacity: 0.54,
            roughness: 0.34,
            side: THREE.DoubleSide,
            transparent: true,
            wireframe: true,
          })
          gltf.scene.traverse((object) => {
            if (!object.isMesh) return
            const originalMaterials = Array.isArray(object.material)
              ? object.material
              : [object.material]
            originalMaterials.forEach((material) => {
              if (!material) return
              discardedMaterials.add(material)
              Object.values(material).forEach((value) => {
                if (value?.isTexture) discardedTextures.add(value)
              })
            })
            object.material = Array.isArray(object.material)
              ? object.material.map(() => hologramMaterial)
              : hologramMaterial
          })
          discardedTextures.forEach((texture) => texture.dispose())
          discardedMaterials.forEach((material) => material.dispose())
          hologram.add(gltf.scene)
          mixer = gltf.animations.length
            ? new THREE.AnimationMixer(gltf.scene)
            : null
          mixer?.clipAction(gltf.animations[0]).play()

          const front = Math.max(modelDepth * 0.28, 10)
          const height = 390
          addMarker('brain', 0x8dbbff, [
            { position: [0, height * 0.385, 0], scale: [13, 15, 7] },
          ], front)
          addMarker('eyes', 0x9df6dc, [
            { position: [-7, height * 0.34, 0], scale: [2.5, 2.5, 2.5] },
            { position: [7, height * 0.34, 0], scale: [2.5, 2.5, 2.5] },
          ], front)
          addMarker('lungs', 0x55d7e8, [
            { position: [-17, height * 0.17, 0], scale: [8, 18, 5] },
            { position: [17, height * 0.17, 0], scale: [8, 18, 5] },
          ], front)
          addMarker('heart', 0xff7185, [
            { position: [0, height * 0.13, 2], scale: [7, 10, 6] },
          ], front)
          addMarker('bones', 0xffcf72, [
            { position: [0, -height * 0.08, 0], scale: [4, 23, 4] },
            { position: [0, -height * 0.18, 0], scale: [17, 6, 6] },
          ], front * 0.72)
          addMarker('muscles', 0xc49bff, [
            { position: [-25, height * 0.06, 0], scale: [7, 16, 5] },
            { position: [25, height * 0.06, 0], scale: [7, 16, 5] },
          ], front * 0.7)
          controller.setSelectedRegion(selectedRegion)
          onModelStateChange('ready')
        } catch (error) {
          console.error('Three.js human model setup error:', error)
          onModelStateChange('error')
        }
      },
      undefined,
      (error) => {
        if (disposed) return
        console.error('Three.js human model load error:', error)
        onModelStateChange('error')
      },
    )

    controller.dispose = () => {
      if (disposed) return
      disposed = true
      loadRequest?.abort()
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
      timer.dispose()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      mixer?.stopAllAction()
      disposeSceneResources(scene)
      renderer.dispose()
      renderer.domElement.remove()
    }

    return controller
  } catch (error) {
    console.error('Three.js scene init error:', error)
    renderer?.dispose()
    renderer?.domElement.remove()
    onModelStateChange('error')
    return controller
  }
}

function disposeSceneResources(root) {
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()

  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry)
    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : object.material
        ? [object.material]
        : []
    objectMaterials.forEach((material) => {
      materials.add(material)
      Object.values(material).forEach((value) => {
        if (value?.isTexture) textures.add(value)
      })
    })
  })

  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
  textures.forEach((texture) => texture.dispose())
}
