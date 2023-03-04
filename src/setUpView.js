import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";

export const setUpView = (ref, actors) => {
    const genericScreenRender = vtkGenericRenderWindow.newInstance({
        background: [0.5, 0.5, 0.5],
    });

    genericScreenRender.setContainer(ref.current);

    const renderWindow = genericScreenRender.getRenderWindow();
    const renderer = genericScreenRender.getRenderer();

    for (const actor of actors) {
        renderer.addActor(actor);
    }

    return {
        renderWindow,
        renderer
    }
}
