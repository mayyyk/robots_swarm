import { Text } from "@react-three/drei"; // npm install @react-three/drei
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Quaternion, Vector3 } from "three";

interface ArrowProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  label: string;
}

export const VectorArrow = ({ start, end, color, label }: ArrowProps) => {
  const groupRef = useRef<any>(null);

  // Konwersja tablic na obiekty THREE.Vector3
  const startVec = new Vector3(...start);
  const endVec = new Vector3(...end);

  const direction = new Vector3().subVectors(endVec, startVec);
  const length = direction.length();

  // Logika ustawiania orientacji strzałki
  // Domyślnie Cylinder w Three.js stoi pionowo (oś Y). Musimy go obrócić w stronę "direction".
  useFrame(() => {
    if (groupRef.current) {
      // Ustawiamy pozycję w połowie długości (bo cylinder ma origin w środku)
      groupRef.current.position.copy(startVec);

      // Magia kwaternionów do obrotu z (0,1,0) na nasz wektor docelowy
      const quaternion = new Quaternion();
      quaternion.setFromUnitVectors(
        new Vector3(0, 1, 0),
        direction.clone().normalize(),
      );
      groupRef.current.setRotationFromQuaternion(quaternion);
    }
  });

  if (length < 0.01) return null; // Nie rysuj zerowych wektorów

  return (
    <group>
      {/* Grupa obracająca się i pozycjonująca */}
      <group ref={groupRef}>
        {/* Trzonek (przesunięty w górę o połowę długości) */}
        <mesh position={[0, length / 2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, length, 12]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Grot (na samym szczycie) */}
        <mesh position={[0, length, 0]}>
          <coneGeometry args={[0.15, 0.3, 12]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>

      {/* Etykieta (tekst 3D) */}
      <Text
        position={[end[0], end[1] + 0.2, end[2]]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};
