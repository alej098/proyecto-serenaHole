import { useEffect, useState } from "react";
import validation from "./validation.js";
import { useDispatch, useSelector } from "react-redux";
import { crearHabitacion } from "../../redux/Actions/actions";
import UpdateHabitacion from "../updateHabitacion/updateHabitacion.jsx";
import axios from "axios";
const CrearHabitacion = () => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [touchedFields, setTouchedFields] = useState({});
  const [isEmpty, setIsEmpty] = useState(true);
  const [cloudinary, setCloudinary] = useState("");

  const [habitacionData, setHabitacionData] = useState({
    nombre: "",
    precio: "",
    imagenes: [],
    servicios: [
      {
        icono: "sensor_door",
        descripcion: "",
      },
      {
        icono: "person",
        descripcion: "",
      },
      {
        icono: "bed",
        descripcion: "",
      },
      {
        icono: "home",
        descripcion: "",
      },
      {
        icono: "local_bar",
        descripcion: "Minibar",
      },
      {
        icono: "wifi",
        descripcion: "WIFI",
      },
    ],
    descripcion: "",
    estado: "Disponible",
  });

  console.log({ habitacionData });
  console.log(errors);

  const isSubmitDisabled = () => {
    // Verifica si hay algún campo obligatorio sin completar
    return Object.values(habitacionData).some(
      (value) => value === "" || (Array.isArray(value) && value.length === 0)
    );
  };

  const handleChangeServicio = (index, event) => {
    const updatedServicios = [...habitacionData.servicios]; // Create a copy of the servicios array
    //   updatedServicios[index].descripcion = event.target.value; // Update the descripcion at the specified index
    if (index === 3) {
      updatedServicios[index].descripcion = event.target.value + " m²";
    } else {
      updatedServicios[index].descripcion = event.target.value;
    }
    setHabitacionData({ ...habitacionData, servicios: updatedServicios }); // Update the state with the modified servicios array
  };

  const handleBlur = (fieldName) => {
    setTouchedFields({ ...touchedFields, [fieldName]: true });

    // Actualiza habitacionData con el campo específico que se ha tocado
    setHabitacionData({
      ...habitacionData,
      [fieldName]: habitacionData[fieldName],
    });

    // Vuelve a validar con la actualización de habitacionData
    setErrors(validation(habitacionData));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setHabitacionData({
      ...habitacionData,
      [name]: value,
    });

    setErrors(
      validation({
        ...habitacionData,
        [name]: value,
      })
    );

    setIsEmpty(false);
  };

  const handleImageSubmit = () => {
    // Verificar que haya una imagen antes de agregarla
    if (habitacionData.imagen) {
      const nuevasImagenes = [...habitacionData.imagenes];

      // Si ya hay 4 imágenes, reemplazar la última
      if (nuevasImagenes.length === 4) {
        nuevasImagenes[3] = habitacionData.imagen;
      } else {
        // Si no hay 4 imágenes, agregar la nueva imagen al final
        nuevasImagenes.push(habitacionData.imagen);
      }

      setHabitacionData({
        ...habitacionData,
        imagenes: nuevasImagenes,
      });
    }
  };

  const handleImageRemove = (index) => {
    const nuevasImagenes = [...habitacionData.imagenes];
    nuevasImagenes.splice(index, 1);

    setHabitacionData({
      ...habitacionData,
      imagenes: nuevasImagenes,
    });
  };

  useEffect(() => {
    // Actualiza el estado submitDisabled en función de los errores y la completitud de los campos
    setSubmitDisabled(Object.keys(errors).length > 0 || isSubmitDisabled());
  }, [errors, habitacionData, isSubmitDisabled]);

  const resetTouchedFields = () => {
    const resetFields = {};
    Object.keys(touchedFields).forEach((fieldName) => {
      resetFields[fieldName] = "";
    });
    setHabitacionData({
      ...habitacionData,
      ...resetFields,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0) {
      dispatch(crearHabitacion(habitacionData));
      resetTouchedFields();
    } else {
      alert("Validation errors:", errors);
    }
  };

  console.log(habitacionData);

  const handleImageCloudinary = async (e) => {
    const file = e.target.files[0];
    const data = new FormData();
    console.log("esteeeee", file);
    data.append("file", file);
    data.append("upload_preset", "preset serena");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/de2jgnztx/image/upload",
      data
    );
    if (habitacionData.imagenes[0] !== undefined) {
      const nuevasImagenes = [...habitacionData.imagenes];

      // Si ya hay 4 imágenes, reemplazar la última
      if (nuevasImagenes.length === 4) {
        nuevasImagenes[3] = response.data.secure_url;
      } else {
        // Si no hay 4 imágenes, agregar la nueva imagen al final
        nuevasImagenes.push(response.data.secure_url);
      }

      setHabitacionData({
        ...habitacionData,
        imagenes: nuevasImagenes,
      });
    } else {
      setHabitacionData({
        ...habitacionData,
        imagenes: [response.data.secure_url],
      });
    }
    console.log("aqui2", response);
  };
  return (
    <div className="flex flex-col justify-center items-center bg-blanco mt-16">
      <div className="bg-verde p-8 rounded-lg mx-20">
        <h1 className="text-4xl font-bold mb-28">Crear Habitación</h1>
        <form
          className="flex flex-row gap-20 mx-2 my-10"
          onSubmit={handleSubmit}
        >
          <div className="w-2/8">
            <div className="grid grid-cols-2 gap-4 ml-8">
              {habitacionData.imagenes.map((imagen, index) => (
                <div key={index} className="relative">
                  <img
                    className="h-36 w-36 object-cover rounded-xl mb-4"
                    src={imagen}
                    alt={`Imagen ${index}`}
                  />
                  <button
                    className="material-symbols-outlined absolute w-36 h-36 top-0 left-0 right-0 bottom-0 text-white opacity-0 hover:opacity-90 transition-opacity"
                    onClick={() => handleImageRemove(index)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <input
              className="mt-2 w-full text-center text-blanco"
              type="file"
              accept="image/*"
              name="imagen"
              placeholder="Imagen URL"
              value={habitacionData.imagen}
              onChange={handleImageCloudinary}
              onBlur={() => handleBlur("imagen")}
            />
            <p className="my-4">{touchedFields.imagen && errors.imagen}</p>
          </div>

          <div className="flex flex-col items-center w-4/8">
            <div className="block font-inter text-2xl font-bold text-blanco mb-8 -mt-[80px]">
              <input
                className="text-center text-negro"
                type="text"
                name="nombre"
                placeholder="Nombre"
                onChange={handleChange}
                onBlur={() => handleBlur("nombre")}
              />
              <p className="my-4">{touchedFields.nombre && errors.nombre}</p>
            </div>

            <div>
              <div className="flex flex-row gap-4">
                <div className="flex flex-col items-center w-1/6">
                  <span className="material-symbols-outlined p-3 text-blanco ">
                    sensor_door
                  </span>
                  <p className="text-blanco text-sm text-center">
                    {
                      <select
                        onChange={(event) => handleChangeServicio(0, event)}
                        name="select"
                        className="ml-2 p-1 rounded-md text-negro text-center w-[80px]"
                      >
                        <option value="" selected>
                          Cuartos
                        </option>
                        <option value="1 cuartos">1</option>
                        <option value="2 cuartos">2</option>
                        <option value="3 cuartos">3</option>
                      </select>
                    }{" "}
                  </p>
                </div>

                <div className="flex flex-col items-center w-1/6">
                  <span className="material-symbols-outlined p-3 text-blanco ">
                    person
                  </span>
                  <p className="text-blanco text-sm text-center">
                    {
                      <select
                        onChange={(event) => handleChangeServicio(1, event)}
                        name="select"
                        className="ml-2 p-1 rounded-md text-negro text-center w-[80px]"
                      >
                        <option value="" selected>
                          Personas
                        </option>
                        <option value="1 pers">1</option>
                        <option value="2 pers">2</option>
                        <option value="3 pers">3</option>
                        <option value="4 pers">4</option>
                        <option value="5 pers">5</option>
                        <option value="6 pers">6</option>
                        <option value="7 pers">7</option>
                        <option value="8 pers">8</option>
                      </select>
                    }
                  </p>
                </div>

                <div className="flex flex-col items-center w-1/6">
                  <span className="material-symbols-outlined p-3 text-blanco">
                    bed
                  </span>
                  <p className="text-blanco text-sm text-center">
                    {
                      <select
                        onChange={(event) => handleChangeServicio(2, event)}
                        name="select"
                        className="ml-2 p-1 rounded-md text-negro text-center w-[80px]"
                      >
                        <option value="" selected>
                          Cama
                        </option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Queen">Queen</option>
                        <option value="King">King</option>
                      </select>
                    }
                  </p>
                </div>

                <div className="flex flex-col items-center w-1/6">
                  <span className="material-symbols-outlined p-3 text-blanco ">
                    home
                  </span>
                  <p className="text-negro text-sm text-center">
                    {
                      <input
                        onChange={(event) => handleChangeServicio(3, event)}
                        className="text-center w-[80px] mr-2 p-1 rounded-md"
                        type="number"
                        name="m2"
                        placeholder="m²"
                      />
                    }
                  </p>
                </div>

                <div className="flex flex-col items-center w-1/5">
                  <span className="material-symbols-outlined p-3 text-blanco ">
                    local_bar
                  </span>
                  <p className="text-blanco text-sm text-center">Minibar</p>
                </div>

                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined p-3 text-blanco ">
                    wifi
                  </span>
                  <p className="text-blanco text-sm text-center">WIFI</p>
                </div>
              </div>
            </div>
            <div className="mt-10 w-full">
              <textarea
                className="w-full h-24 text-center pt-8"
                name="descripcion"
                placeholder="Descripcion"
                value={habitacionData.descripcion}
                onChange={handleChange}
                onBlur={() => handleBlur("descripcion")}
              />
              <p>{touchedFields.descripcion && errors.descripcion}</p>
            </div>
          </div>

          <div className="p-6 pt-3 flex flex-col items-center gap-4 w-2/8">
            <p className="text-2xl font-bold text-blanco w-2/3 justify-center mt-4">
              $
              {
                <input
                  className="text-2xl font-bold text-negro w-1/3 mx-4 text-center"
                  type="number"
                  name="precio"
                  min="0"
                  placeholder="-"
                  onChange={handleChange}
                  onBlur={() => handleBlur("precio")}
                />
              }
              /Noche
            </p>
            <p className="my-4">{touchedFields.precio && errors.precio}</p>

            <button
              className="w-full mt-2 mb-4 select-none rounded-lg bg-naranja py-3.5 px-7 text-center align-middle font-inter text-base font-bold uppercase text-blanco transition-all focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none border-2 border-naranja hover:border-blanco"
              type="submit"
              disabled={isSubmitDisabled()}
            >
              Crear
            </button>
          </div>
        </form>
      </div>
      <UpdateHabitacion />
    </div>
  );
};

export default CrearHabitacion;
